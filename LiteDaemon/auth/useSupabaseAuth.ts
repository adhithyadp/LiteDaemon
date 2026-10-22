import { create } from 'zustand'
import { supabase, UserProfile } from './supabaseClient'
import type { User } from '@supabase/supabase-js'
import { openUrl } from '@tauri-apps/plugin-opener'
import { onOpenUrl } from '@tauri-apps/plugin-deep-link'
import { useAuthStore } from '../../src/stores/authStore'

interface SupabaseAuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null

  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

let deepLinkInitialized = false

function syncAuthStoreUser(user: User | null) {
  if (user) {
    useAuthStore.setState({
      user: {
        id: user.id,
        email: user.email ?? '',
        name: user.user_metadata?.full_name ?? null,
        emailVerified: !!user.email_confirmed_at,
      },
    })
  } else {
    useAuthStore.setState({ user: null })
  }
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
        syncAuthStoreUser(session.user)
        await get().refreshProfile()
      } else {
        syncAuthStoreUser(null)
        set({ user: null, profile: null, loading: false })
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          set({ user: session.user })
          syncAuthStoreUser(session.user)
          await get().refreshProfile()
        } else {
          syncAuthStoreUser(null)
          set({ user: null, profile: null, loading: false })
        }
      })

      // Setup deep link listener for Google OAuth callbacks
      if (!deepLinkInitialized) {
        deepLinkInitialized = true
        try {
          await onOpenUrl(async (urls) => {
            for (const rawUrl of urls) {
              await handleSupabaseCallback(rawUrl)
            }
          })
        } catch {
          // deep-link plugin not available in plain web browser mode
        }
      }
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
        useAuthStore.setState({
          plan: 'free',
          source: 'free',
          subscriptionStatus: null,
          licenseStatus: null,
        })
        set({ profile: fallbackProfile, loading: false })
        return
      }

      const prof = data as UserProfile
      if (prof?.plan === 'pro' || prof?.plan === 'lifetime') {
        useAuthStore.setState({
          plan: 'pro',
          source: 'stripe',
          subscriptionStatus: 'active',
          licenseStatus: 'active',
          cloudWordsLimit: 99999999,
        })
      } else {
        useAuthStore.setState({
          plan: 'free',
          source: 'free',
          subscriptionStatus: null,
          licenseStatus: null,
        })
      }

      set({ profile: prof, loading: false })
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

  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://litedaemon.xyz/auth-callback',
          skipBrowserRedirect: true,
          scopes: 'email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        set({ error: error.message, loading: false })
        return { success: false, error: error.message }
      }

      if (data?.url) {
        await openUrl(data.url)
      }
      set({ loading: false })
      return { success: true }
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Google sign in failed'
      set({ error: msg, loading: false })
      return { success: false, error: msg }
    }
  },

  signOut: async () => {
    set({ loading: true })
    try {
      await supabase.auth.signOut()
    } finally {
      useAuthStore.setState({
        plan: 'free',
        source: 'free',
        subscriptionStatus: null,
        licenseStatus: null,
      })
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

export async function handleSupabaseCallback(rawUrl: string): Promise<boolean> {
  try {
    const url = new URL(rawUrl)
    if (url.protocol !== 'litedaemon:' && url.protocol !== 'opentypeless:') {
      return false
    }

    const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''))
    const searchParams = url.searchParams

    const errorParam = searchParams.get('error') || hashParams.get('error')
    const errorDesc = searchParams.get('error_description') || hashParams.get('error_description')
    if (errorParam) {
      const decodedDesc = errorDesc ? decodeURIComponent(errorDesc.replace(/\+/g, ' ')) : errorParam
      console.error('Supabase OAuth callback returned error:', errorParam, decodedDesc)
      useSupabaseAuth.setState({ error: decodedDesc, loading: false })
      return false
    }

    const accessToken = hashParams.get('access_token') || searchParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token')

    if (accessToken && refreshToken) {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
      if (!error && data.session) {
        await useSupabaseAuth.getState().initialize()
        try {
          const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
          const win = getCurrentWebviewWindow()
          await win.unminimize()
          await win.show()
          await win.setFocus()
        } catch (e) {}
        return true
      }
    }

    const code = searchParams.get('code')
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error && data.session) {
        await useSupabaseAuth.getState().initialize()
        try {
          const { getCurrentWebviewWindow } = await import('@tauri-apps/api/webviewWindow')
          const win = getCurrentWebviewWindow()
          await win.unminimize()
          await win.show()
          await win.setFocus()
        } catch (e) {}
        return true
      }
    }
  } catch (err) {
    console.error('Error handling deep link callback:', err)
  }
  return false
}
