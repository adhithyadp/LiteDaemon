// =============================================================================
// LiteDaemon Usage Store
// LiteDaemon/cloud/usageStore.ts
//
// Tracks the user's plan type so the app knows which mode to operate in:
//   - 'free'  → BYOK mode, app is free, user provides their own API keys
//   - 'byok'  → BYOK Pro (legacy paid BYOK — treated same as free functionally)
//   - 'cloud' → Cloud Pro, uses LiteDaemon managed STT + Polish via cloud-proxy
//
// No usage limits, no word counts — that complexity is gone.
// Cloud = paid, BYOK/free = free. Simple.
// =============================================================================

import { create } from 'zustand'
import { supabase } from '../auth/supabaseClient'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type LiteDaemonPlanType = 'free' | 'byok' | 'cloud'

export interface UsageState {
  // Plan
  planType: LiteDaemonPlanType
  isCloudPro: boolean   // cloud pro subscriber — uses managed STT+Polish
  isByokPro: boolean    // paid BYOK (legacy)
  isFree: boolean       // free user — uses BYOK with own keys, no payment needed

  // Loading
  loading: boolean
  initialized: boolean

  // Actions
  initialize: (userId: string) => Promise<void>
  reset: () => void
}

// -----------------------------------------------------------------------------
// Default state
// -----------------------------------------------------------------------------

function defaultState(): Omit<UsageState, 'initialize' | 'reset'> {
  return {
    planType: 'free',
    isCloudPro: false,
    isByokPro: false,
    isFree: true,
    loading: false,
    initialized: false,
  }
}

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useLiteDaemonUsage = create<UsageState>((set) => ({
  ...defaultState(),

  // ---------------------------------------------------------------------------
  // initialize: fetch plan type from Supabase on sign-in
  // ---------------------------------------------------------------------------
  initialize: async (userId: string) => {
    set({ loading: true })

    try {
      const [profileRes, planRes] = await Promise.all([
        supabase
          .from('profiles')
          .select('plan, status')
          .eq('id', userId)
          .maybeSingle(),
        supabase
          .from('user_plans')
          .select('plan_type')
          .eq('user_id', userId)
          .maybeSingle(),
      ])

      const isPro =
        profileRes.data?.plan === 'pro' && profileRes.data?.status === 'active'
      const rawPlanType: string = planRes.data?.plan_type || 'byok'

      // Cloud Pro is only for active Pro users on the 'cloud' plan.
      // BYOK is free forever, so anyone not on cloud is Free (BYOK).
      const isCloudPro = isPro && rawPlanType === 'cloud'
      const planType: LiteDaemonPlanType = isCloudPro ? 'cloud' : 'free'

      set({
        planType,
        isCloudPro,
        isByokPro: false,
        isFree: !isCloudPro,
        loading: false,
        initialized: true,
      })
    } catch (err) {
      console.error('[LiteDaemon] usageStore.initialize failed:', err)
      set({ loading: false, initialized: true })
    }
  },

  // ---------------------------------------------------------------------------
  // reset: called on sign-out
  // ---------------------------------------------------------------------------
  reset: () => set(defaultState()),
}))
