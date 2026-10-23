import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://nlfbtfwcsvoaliuvfwya.supabase.co'
export const SUPABASE_ANON_KEY =
  'sb_publishable_XU1Zdv6f9QbpYDn6XNJj8Q_OrytlJmk'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

export interface UserProfile {
  id: string
  email: string
  plan: 'free' | 'pro' | 'lifetime'
  status: string
  created_at: string
  updated_at: string
}
