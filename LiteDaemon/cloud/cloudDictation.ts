// =============================================================================
// LiteDaemon Cloud Dictation Client
// LiteDaemon/cloud/cloudDictation.ts
//
// Sends recorded audio to the LiteDaemon cloud-proxy Supabase Edge Function.
// This module is the bridge between the app's audio pipeline and our backend.
//
// Called by the frontend pipeline hook (Part 5b — thin wrapper in src/)
// when the user is on the Cloud plan.
//
// Input:  Uint8Array of WAV audio bytes (16kHz, 16-bit, mono — same as upstream)
// Output: { transcript, polished, words_used, week_total } or throws CloudDictationError
// =============================================================================

import { supabase } from '../auth/supabaseClient'
import { useLiteDaemonUsage } from './usageStore'

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const CLOUD_PROXY_URL =
  'https://nlfbtfwcsvoaliuvfwya.supabase.co/functions/v1/cloud-proxy'

// Timeout for the cloud proxy request (audio upload + STT + LLM polish)
const REQUEST_TIMEOUT_MS = 60_000

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CloudDictationRequest {
  /** Raw WAV audio bytes (16kHz 16-bit mono) */
  audioBytes: Uint8Array
  /** Language hint e.g. "en", "hi", "multi" */
  language?: string
  /** AI polish style */
  polishStyle?: 'minimal' | 'clean' | 'structured' | 'professional'
  /** Optional selected text context (for edit-mode dictation) */
  selectedText?: string
}

export interface CloudDictationResult {
  transcript: string
  polished: string
  words_used: number
  week_total: number
  is_cloud_pro: boolean
  resets_on: string
}

export class CloudDictationError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly data?: Record<string, unknown>,
  ) {
    super(message)
    this.name = 'CloudDictationError'
  }
}

// -----------------------------------------------------------------------------
// Main function
// -----------------------------------------------------------------------------

export async function runCloudDictation(
  req: CloudDictationRequest,
): Promise<CloudDictationResult> {
  // 1. Get the current Supabase session JWT
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new CloudDictationError(
      'unauthenticated',
      'You must be signed in to use cloud dictation. Please sign in and try again.',
    )
  }

  const jwt = session.access_token

  // 2. Pre-check: is the user at the free tier limit?
  //    (Optimistic local check before hitting the network)
  const { isFree, isLimitReached, wordsUsedThisWeek, weeklyLimit } =
    useLiteDaemonUsage.getState()

  if (isFree && isLimitReached) {
    throw new CloudDictationError(
      'free_tier_limit_reached',
      `You've used all ${weeklyLimit} free words this week. Upgrade to Pro for unlimited dictation.`,
      { words_used: wordsUsedThisWeek, limit: weeklyLimit },
    )
  }

  // 3. Build request headers (metadata sent as headers, audio as raw body)
  const headers: Record<string, string> = {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'audio/wav',
    'x-audio-language': req.language ?? 'multi',
    'x-polish-style': req.polishStyle ?? 'clean',
    'x-sample-rate': '16000',
  }

  if (req.selectedText) {
    // URL-encode so any special characters in selected text are safe
    headers['x-selected-text'] = encodeURIComponent(req.selectedText)
  }

  // 4. Send request with timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(CLOUD_PROXY_URL, {
      method: 'POST',
      headers,
      body: req.audioBytes,
      signal: controller.signal,
    })
  } catch (err) {
    clearTimeout(timeoutId)
    if (err instanceof Error && err.name === 'AbortError') {
      throw new CloudDictationError(
        'timeout',
        'Cloud dictation timed out. Check your internet connection and try again.',
      )
    }
    throw new CloudDictationError(
      'network_error',
      'Could not reach LiteDaemon cloud service. Check your internet connection.',
    )
  }
  clearTimeout(timeoutId)

  // 5. Parse response
  let body: Record<string, unknown>
  try {
    body = await response.json()
  } catch {
    throw new CloudDictationError(
      'invalid_response',
      'Received an unexpected response from the cloud service.',
    )
  }

  // 6. Handle error responses from the proxy
  if (!response.ok) {
    const code = (body.error as string) || 'cloud_error'
    const message = (body.message as string) || 'Cloud dictation failed. Please try again.'

    if (code === 'free_tier_limit_reached') {
      // Update local usage state to reflect the server-confirmed limit
      const words_used = (body.words_used as number) || wordsUsedThisWeek
      useLiteDaemonUsage.getState().recordUsage(0, words_used)

      throw new CloudDictationError(code, message, {
        words_used: body.words_used,
        limit: body.limit,
        resets_on: body.resets_on,
      })
    }

    if (code === 'unauthorized') {
      throw new CloudDictationError(code, 'Your session has expired. Please sign in again.')
    }

    throw new CloudDictationError(code, message)
  }

  // 7. Parse successful result
  const result: CloudDictationResult = {
    transcript: (body.transcript as string) || '',
    polished: (body.polished as string) || '',
    words_used: (body.words_used as number) || 0,
    week_total: (body.week_total as number) || 0,
    is_cloud_pro: (body.is_cloud_pro as boolean) || false,
    resets_on: (body.resets_on as string) || '',
  }

  // 8. Update local usage state with the authoritative week total from server
  if (result.words_used > 0) {
    useLiteDaemonUsage.getState().recordUsage(result.words_used, result.week_total)
  }

  return result
}

// -----------------------------------------------------------------------------
// Helper: check if cloud dictation is available for the current user
// Call this before attempting to use cloud dictation.
// -----------------------------------------------------------------------------

export interface CloudDictationAvailability {
  available: boolean
  reason:
    | 'signed_out'        // user not signed in
    | 'byok'              // user is BYOK pro — use local keys instead
    | 'free_limit'        // free user hit weekly limit
    | 'free_available'    // free user still has words remaining
    | 'cloud_pro'         // cloud pro — unlimited
}

export function getCloudDictationAvailability(): CloudDictationAvailability {
  const { isFree, isCloudPro, isByokPro, isLimitReached } =
    useLiteDaemonUsage.getState()

  // Check sign-in state via Supabase synchronously (from session cache)
  const session = supabase.auth.getUser()
  void session // just referencing to avoid lint — actual check via plan state

  if (isByokPro) {
    return { available: false, reason: 'byok' }
  }

  if (isCloudPro) {
    return { available: true, reason: 'cloud_pro' }
  }

  if (isFree && isLimitReached) {
    return { available: false, reason: 'free_limit' }
  }

  if (isFree) {
    return { available: true, reason: 'free_available' }
  }

  return { available: false, reason: 'signed_out' }
}
