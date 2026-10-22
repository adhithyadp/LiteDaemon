import { createClient } from '@supabase/supabase-js'

export const SUPABASE_URL = 'https://nlfbtfwcsvoaliuvfwya.supabase.co'
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5sZmJ0Zndjc3ZvYWxpdXZmd3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODQ3MjcsImV4cCI6MjEwODI2MDcyN30.cpuQvvjJV_ZgU6AnPM08GwszUfnf2l15glOQlu1r85U'

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
