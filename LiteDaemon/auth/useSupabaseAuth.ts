import { create } from 'zustand'
import { supabase, UserProfile } from './supabaseClient'
import type { User } from '@supabase/supabase-js'

interface SupabaseAuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null

  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

export const useSupabaseAuth = create<SupabaseAuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true, error: null })
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {
        set({ user: session.user })
        await get().refreshProfile()
      } else {
        set({ user: null, profile: null, loading: false })
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ user: session.user })
          await get().refreshProfile()
        } else {
          set({ user: null, profile: null, loading: false })
        }
      })
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : 'Failed to initialize session',
        loading: false,
      })
    }
  },

  refreshProfile: async () => {
    const { user } = get()
    if (!user) {
      set({ profile: null, loading: false })
      return
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        // If profile row doesn't exist yet, create a default fallback profile
        const fallbackProfile: UserProfile = {
          id: user.id,
          email: user.email ?? '',
          plan: 'free',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        set({ profile: fallbackProfile, loading: false })
        return
      }

      set({ profile: data as UserProfile, loading: false })
    } catch (e) {
      console.error('Error fetching profile:', e)
      set({ loading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (error) {
        set({ error: error.message, loading: false })
        return { success: false, error: error.message }
      }

      set({ user: data.user, loading: false })
      await get().refreshProfile()
      return { success: true }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign in failed'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  signUp: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })

      if (error) {
        set({ error: error.message, loading: false })
        return { success: false, error: error.message }
      }

      set({ user: data.user, loading: false })
      if (data.user) {
        await get().refreshProfile()
      }
      return { success: true }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Sign up failed'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
    } finally {
      set({ user: null, profile: null, loading: false, error: null })
    }
  },

  resetPassword: async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
      if (error) return { success: false, error: error.message }
      return { success: true }
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Failed to send reset link',
      }
    }
  },
}))
