// =============================================================================
// LiteDaemon Cloud Dictation Client
// LiteDaemon/cloud/cloudDictation.ts
//
// Sends recorded audio to the LiteDaemon cloud-proxy Supabase Edge Function.
// Only available to Cloud Pro subscribers — BYOK users use their own keys in-app.
//
// Input:  Uint8Array of WAV audio bytes (16kHz, 16-bit, mono)
// Output: { transcript, polished } or throws CloudDictationError
// =============================================================================

import { supabase } from '../auth/supabaseClient'
import { useLiteDaemonUsage } from './usageStore'

// -----------------------------------------------------------------------------
// Config
// -----------------------------------------------------------------------------

const CLOUD_PROXY_URL =
  'https://nlfbtfwcsvoaliuvfwya.supabase.co/functions/v1/cloud-proxy'

const REQUEST_TIMEOUT_MS = 60_000

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface CloudDictationRequest {
  audioBytes: Uint8Array
  language?: string
  polishStyle?: 'minimal' | 'clean' | 'structured' | 'professional'
  selectedText?: string
}

export interface CloudDictationResult {
  transcript: string
  polished: string
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
  // 1. Get Supabase session JWT
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

  // 2. Pre-flight: must be Cloud Pro
  const { isCloudPro } = useLiteDaemonUsage.getState()
  if (!isCloudPro) {
    throw new CloudDictationError(
      'subscription_required',
      'LiteDaemon Cloud requires an active Cloud Pro subscription.',
    )
  }

  const jwt = session.access_token

  // 3. Build request headers
  const headers: Record<string, string> = {
    Authorization: `Bearer ${jwt}`,
    'Content-Type': 'audio/wav',
    'x-audio-language': req.language ?? 'multi',
    'x-polish-style': req.polishStyle ?? 'clean',
    'x-sample-rate': '16000',
  }

  if (req.selectedText) {
    headers['x-selected-text'] = encodeURIComponent(req.selectedText)
  }

  // 4. Send with timeout
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
    throw new CloudDictationError('invalid_response', 'Unexpected response from cloud service.')
  }

  // 6. Handle errors
  if (!response.ok) {
    const code = (body.error as string) || 'cloud_error'
    const message = (body.message as string) || 'Cloud dictation failed. Please try again.'

    if (code === 'subscription_required') {
      throw new CloudDictationError(code, message)
    }
    if (code === 'unauthorized') {
      throw new CloudDictationError(code, 'Your session expired. Please sign in again.')
    }
    throw new CloudDictationError(code, message)
  }

  return {
    transcript: (body.transcript as string) || '',
    polished: (body.polished as string) || '',
  }
}

// -----------------------------------------------------------------------------
// Availability check
// -----------------------------------------------------------------------------

export type CloudDictationReason =
  | 'cloud_pro'         // ✅ Cloud Pro subscriber — can use
  | 'byok'              // use BYOK path instead
  | 'free'              // free user — use BYOK path
  | 'signed_out'        // not signed in

export function getCloudDictationAvailability(): {
  available: boolean
  reason: CloudDictationReason
} {
  const { isCloudPro, isByokPro, isFree } = useLiteDaemonUsage.getState()

  if (isCloudPro) return { available: true, reason: 'cloud_pro' }
  if (isByokPro) return { available: false, reason: 'byok' }
  if (isFree) return { available: false, reason: 'free' }
  return { available: false, reason: 'signed_out' }
}
