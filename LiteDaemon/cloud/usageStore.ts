// =============================================================================
// LiteDaemon Usage Store
// LiteDaemon/cloud/usageStore.ts
//
// Tracks the user's weekly word usage for the free tier (2000 words/week).
// Lives entirely in LiteDaemon/ — zero upstream file changes.
//
// Responsibilities:
//   - Fetch current week usage from Supabase on sign-in
//   - Update locally (optimistically) after each cloud proxy response
//   - Expose plan type (free | byok | cloud) so the app knows which mode to use
//   - Expose usage state for the usage indicator UI (Part 6)
//
// Used by:
//   - cloudDictation.ts (Part 5) — checks plan, updates after each request
//   - LiteDaemonUsageBar.tsx (Part 6) — reads state to show usage indicator
// =============================================================================

import { create } from 'zustand'
import { supabase } from '../auth/supabaseClient'

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

export const FREE_TIER_WEEKLY_WORD_LIMIT = 1000

/** Monday of the current UTC week as YYYY-MM-DD */
function getCurrentWeekStart(): string {
  const now = new Date()
  const day = now.getUTCDay() // 0=Sun, 1=Mon
  const diff = day === 0 ? -6 : 1 - day
  const monday = new Date(now)
  monday.setUTCDate(now.getUTCDate() + diff)
  return monday.toISOString().split('T')[0]
}

/** Next Monday YYYY-MM-DD — when free tier resets */
function getNextMonday(): string {
  const now = new Date()
  const day = now.getUTCDay()
  const diff = day === 0 ? 1 : 8 - day
  const next = new Date(now)
  next.setUTCDate(now.getUTCDate() + diff)
  return next.toISOString().split('T')[0]
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/** What plan the user is on from LiteDaemon's perspective */
export type LiteDaemonPlanType = 'free' | 'byok' | 'cloud'

export interface UsageState {
  // Plan
  planType: LiteDaemonPlanType
  isCloudPro: boolean   // true only if planType === 'cloud'
  isByokPro: boolean    // true only if planType === 'byok'
  isFree: boolean       // true if planType === 'free'

  // Usage (relevant for free users & analytics)
  wordsUsedThisWeek: number
  weeklyLimit: number         // FREE_TIER_WEEKLY_WORD_LIMIT for free, Infinity for pro
  weekStart: string           // YYYY-MM-DD
  resetsOn: string            // YYYY-MM-DD (next Monday)
  isLimitReached: boolean     // wordsUsedThisWeek >= weeklyLimit (free only)
  usagePercent: number        // 0–100, capped at 100

  // Loading
  loading: boolean
  initialized: boolean

  // Actions
  initialize: (userId: string) => Promise<void>
  /** Called after each successful cloud proxy response to update usage locally */
  recordUsage: (wordsUsed: number, newWeekTotal: number) => void
  /** Called on sign-out to reset state */
  reset: () => void
}

// -----------------------------------------------------------------------------
// Default / signed-out state
// -----------------------------------------------------------------------------

function defaultState(): Omit<UsageState, 'initialize' | 'recordUsage' | 'reset'> {
  return {
    planType: 'free',
    isCloudPro: false,
    isByokPro: false,
    isFree: true,
    wordsUsedThisWeek: 0,
    weeklyLimit: FREE_TIER_WEEKLY_WORD_LIMIT,
    weekStart: getCurrentWeekStart(),
    resetsOn: getNextMonday(),
    isLimitReached: false,
    usagePercent: 0,
    loading: false,
    initialized: false,
  }
}

// -----------------------------------------------------------------------------
// Derived helpers
// -----------------------------------------------------------------------------

function deriveUsageFields(
  planType: LiteDaemonPlanType,
  wordsUsedThisWeek: number,
) {
  const isFree = planType === 'free'
  const weeklyLimit = isFree ? FREE_TIER_WEEKLY_WORD_LIMIT : Infinity
  const isLimitReached = isFree && wordsUsedThisWeek >= FREE_TIER_WEEKLY_WORD_LIMIT
  const usagePercent = isFree
    ? Math.min(100, Math.round((wordsUsedThisWeek / FREE_TIER_WEEKLY_WORD_LIMIT) * 100))
    : 0

  return {
    isCloudPro: planType === 'cloud',
    isByokPro: planType === 'byok',
    isFree,
    weeklyLimit,
    isLimitReached,
    usagePercent,
  }
}

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useLiteDaemonUsage = create<UsageState>((set, get) => ({
  ...defaultState(),

  // ---------------------------------------------------------------------------
  // initialize: fetch plan type + current week usage from Supabase
  // Called once after the user signs in (from useSupabaseAuth)
  // ---------------------------------------------------------------------------
  initialize: async (userId: string) => {
    set({ loading: true })

    try {
      // Fetch both plan type and usage in parallel
      const weekStart = getCurrentWeekStart()

      const [planRes, usageRes] = await Promise.all([
        supabase
          .from('user_plans')
          .select('plan_type')
          .eq('user_id', userId)
          .maybeSingle(),

        supabase
          .from('usage_tracking')
          .select('words_used, week_start')
          .eq('user_id', userId)
          .eq('week_start', weekStart)
          .maybeSingle(),
      ])

      // Also check profiles for pro status
      const profileRes = await supabase
        .from('profiles')
        .select('plan, status')
        .eq('id', userId)
        .maybeSingle()

      const isPro =
        profileRes.data?.plan === 'pro' && profileRes.data?.status === 'active'
      const rawPlanType: string = planRes.data?.plan_type || 'byok'

      let planType: LiteDaemonPlanType
      if (!isPro) {
        planType = 'free'
      } else if (rawPlanType === 'cloud') {
        planType = 'cloud'
      } else {
        planType = 'byok'
      }

      const wordsUsedThisWeek = usageRes.data?.words_used ?? 0

      set({
        planType,
        wordsUsedThisWeek,
        weekStart,
        resetsOn: getNextMonday(),
        ...deriveUsageFields(planType, wordsUsedThisWeek),
        loading: false,
        initialized: true,
      })
    } catch (err) {
      console.error('[LiteDaemon] usageStore.initialize failed:', err)
      // Fail open — don't block the app
      set({ loading: false, initialized: true })
    }
  },

  // ---------------------------------------------------------------------------
  // recordUsage: optimistic local update after a cloud proxy response
  // newWeekTotal comes directly from the proxy response (authoritative)
  // ---------------------------------------------------------------------------
  recordUsage: (wordsUsed: number, newWeekTotal: number) => {
    const { planType } = get()
    // Use the authoritative total from the server, fall back to local increment
    const wordsUsedThisWeek = newWeekTotal > 0 ? newWeekTotal : get().wordsUsedThisWeek + wordsUsed

    set({
      wordsUsedThisWeek,
      ...deriveUsageFields(planType, wordsUsedThisWeek),
    })
  },

  // ---------------------------------------------------------------------------
  // reset: called on sign-out
  // ---------------------------------------------------------------------------
  reset: () => set(defaultState()),
}))
