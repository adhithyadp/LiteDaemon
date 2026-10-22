import React, { useState, useEffect } from 'react'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  LogOut,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Zap,
} from 'lucide-react'
import { openUrl } from '@tauri-apps/plugin-opener'
import { useSupabaseAuth } from '../auth/useSupabaseAuth'
import { useRoute } from '../../src/lib/router'

export function LiteDaemonAccount() {
  const { user, profile, loading, error, initialize, signIn, signUp, signOut, resetPassword } =
    useSupabaseAuth()
  const { navigate } = useRoute()

  const [tab, setTab] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [forgotMode, setForgotMode] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSuccessMsg(null)

    if (!email.trim() || !password) {
      setLocalError('Please fill in all fields.')
      return
    }

    if (tab === 'signup' && password !== confirmPassword) {
      setLocalError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.')
      return
    }

    setIsSubmitting(true)
    try {
      if (tab === 'signin') {
        const res = await signIn(email, password)
        if (!res.success) {
          setLocalError(res.error || 'Failed to sign in. Please check your credentials.')
        }
      } else {
        const res = await signUp(email, password)
        if (!res.success) {
          setLocalError(res.error || 'Failed to create account.')
        } else {
          setSuccessMsg('Account created successfully! Check your email to verify if needed.')
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setLocalError('Please enter your email above to receive a reset link.')
      return
    }
    setIsSubmitting(true)
    setLocalError(null)
    setSuccessMsg(null)
    try {
      const res = await resetPassword(email)
      if (res.success) {
        setSuccessMsg('Password reset link sent to your email!')
      } else {
        setLocalError(res.error || 'Failed to send reset link.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenBillingPortal = async () => {
    try {
      await openUrl('https://customer.dodopayments.com')
    } catch (err) {
      console.error('Failed to open Dodo customer portal:', err)
    }
  }

  if (loading && !user) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  // -------------------------------------------------------------
  // LOGGED IN STATE
  // -------------------------------------------------------------
  if (user) {
    const isPro = profile?.plan === 'pro' || profile?.plan === 'lifetime'
    const memberSince = user.created_at
      ? new Date(user.created_at).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Active'

    return (
      <div className="mx-auto max-w-[480px] px-4 py-8 animate-in fade-in duration-300">
        {/* Profile Card */}
        <div
          className="rounded-[20px] p-6 backdrop-blur-md transition-all duration-300"
          style={{
            background: 'var(--bg-elevated, var(--bg-secondary))',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Avatar & Header */}
          <div className="flex items-center gap-4 pb-5 border-b border-border">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-blue-400 text-white shadow-md">
              <User className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h2 className="truncate text-[16px] font-semibold text-text-primary">
                  {user.email}
                </h2>
              </div>
              <div className="mt-1 flex items-center gap-2">
                {isPro ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500 border border-emerald-500/20">
                    <Sparkles className="h-3 w-3" />
                    Pro Member
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-neutral-500/10 px-2.5 py-0.5 text-[11px] font-medium text-text-secondary border border-border">
                    Free (BYOK)
                  </span>
                )}
                <span className="text-[12px] text-text-tertiary">• Joined {memberSince}</span>
              </div>
            </div>
          </div>

          {/* Subscription Status Details */}
          <div className="mt-5 space-y-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">Current Plan</span>
              <span className="font-medium text-text-primary">
                {isPro ? 'LiteDaemon Pro' : 'LiteDaemon Free'}
              </span>
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">Account Status</span>
              <span className="flex items-center gap-1.5 font-medium text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active
              </span>
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <span className="text-text-secondary">Security</span>
              <span className="flex items-center gap-1.5 text-text-primary font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-accent" />
                Cloud Authenticated
              </span>
            </div>
          </div>

          {/* Action Callouts */}
          <div className="mt-6 pt-5 border-t border-border">
            {isPro ? (
              <button
                type="button"
                onClick={handleOpenBillingPortal}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg-secondary px-4 py-2.5 text-[13px] font-medium text-text-primary transition-all duration-200 hover:bg-bg-hover hover:border-accent cursor-pointer"
              >
                <ExternalLink className="h-4 w-4 text-accent" />
                Manage Billing & Invoices
              </button>
            ) : (
              <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[13px] font-semibold text-accent">
                  <Zap className="h-4 w-4" />
                  Upgrade to LiteDaemon Pro
                </div>
                <p className="mt-1 text-[12px] text-text-secondary">
                  Unlock managed Whisper voice recognition without needing your own OpenAI keys.
                </p>
                <button
                  type="button"
                  onClick={() => navigate('upgrade')}
                  className="mt-3 w-full rounded-xl bg-accent px-4 py-2 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:opacity-90 cursor-pointer"
                >
                  View Plans & Pricing
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={signOut}
            className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-[13px] font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer border-none bg-transparent"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  // -------------------------------------------------------------
  // LOGGED OUT STATE (SIGN IN / SIGN UP)
  // -------------------------------------------------------------
  return (
    <div className="mx-auto max-w-[380px] px-4 py-10 animate-in fade-in duration-300">
      <div className="text-center mb-6">
        <h1 className="text-[20px] font-bold text-text-primary">
          {forgotMode ? 'Reset Password' : tab === 'signin' ? 'Welcome Back' : 'Create Account'}
        </h1>
        <p className="text-[13px] text-text-secondary mt-1">
          {forgotMode
            ? 'Enter your email to receive a password recovery link'
            : tab === 'signin'
              ? 'Sign in to sync your profile and access Pro features'
              : 'Sign up to get started with LiteDaemon'}
        </p>
      </div>

      <div
        className="rounded-[20px] p-6 backdrop-blur-md transition-all duration-300"
        style={{
          background: 'var(--bg-elevated, var(--bg-secondary))',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Tab switcher (Sign in vs Sign up) */}
        {!forgotMode && (
          <div className="mb-5 flex rounded-xl bg-bg-secondary p-1 border border-border">
            <button
              type="button"
              onClick={() => {
                setTab('signin')
                setLocalError(null)
                setSuccessMsg(null)
              }}
              className={`flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer border-none ${
                tab === 'signin'
                  ? 'bg-bg-primary text-text-primary shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup')
                setLocalError(null)
                setSuccessMsg(null)
              }}
              className={`flex-1 rounded-lg py-1.5 text-[13px] font-medium transition-all duration-200 cursor-pointer border-none ${
                tab === 'signup'
                  ? 'bg-bg-primary text-text-primary shadow-sm'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Alerts */}
        {(localError || error) && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-red-500/10 p-3 text-[12px] text-red-500 border border-red-500/20">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{localError || error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-500/10 p-3 text-[12px] text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-[12px] font-medium text-text-secondary">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-border bg-bg-secondary py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none transition-colors focus:border-accent"
              />
            </div>
          </div>

          {!forgotMode && (
            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-[12px] font-medium text-text-secondary">Password</label>
                {tab === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true)
                      setLocalError(null)
                      setSuccessMsg(null)
                    }}
                    className="border-none bg-transparent text-[11px] font-medium text-accent hover:underline cursor-pointer p-0"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={tab === 'signin' ? 'current-password' : 'new-password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-secondary py-2 pl-9 pr-10 text-[13px] text-text-primary outline-none transition-colors focus:border-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent text-text-tertiary hover:text-text-primary cursor-pointer p-0"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          {tab === 'signup' && !forgotMode && (
            <div>
              <label className="mb-1 block text-[12px] font-medium text-text-secondary">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-bg-secondary py-2 pl-9 pr-3 text-[13px] text-text-primary outline-none transition-colors focus:border-accent"
                />
              </div>
            </div>
          )}

          {forgotMode ? (
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50 cursor-pointer border-none"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Send Reset Link
              </button>
              <button
                type="button"
                onClick={() => {
                  setForgotMode(false)
                  setLocalError(null)
                  setSuccessMsg(null)
                }}
                className="w-full border-none bg-transparent py-2 text-[12px] text-text-secondary hover:text-text-primary cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-[13px] font-medium text-white shadow-sm transition-all duration-200 hover:opacity-90 disabled:opacity-50 cursor-pointer border-none"
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {tab === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
