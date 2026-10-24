import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Loader2, UserCircle, CheckCircle2, Sparkles, AlertCircle } from 'lucide-react'
import { useSupabaseAuth } from '../auth/useSupabaseAuth'
import { useLiteDaemonUsage } from '../cloud/usageStore'

type Tab = 'signin' | 'signup'

export function LiteDaemonOnboardingAccount() {
  const { t } = useTranslation()
  const { user, loading, error, initialize, signIn, signUp, signInWithGoogle } =
    useSupabaseAuth()

  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  useEffect(() => {
    initialize()
  }, [initialize])

  const displayError = localError || error

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError(null)

    if (!email.trim() || !password) {
      setLocalError(t('onboarding.account.fillAllFields', 'Please fill in all fields.'))
      return
    }

    if (tab === 'signup') {
      if (password !== confirmPassword) {
        setLocalError(t('onboarding.account.passwordMismatch', 'Passwords do not match.'))
        return
      }
      if (password.length < 6) {
        setLocalError(
          t('onboarding.account.passwordTooShort', 'Password must be at least 6 characters.'),
        )
        return
      }
    }

    setIsSubmitting(true)
    try {
      if (tab === 'signin') {
        const res = await signIn(email, password)
        if (!res.success) {
          setLocalError(res.error || t('onboarding.account.signInFailed', 'Sign in failed.'))
        }
      } else {
        const res = await signUp(email, password)
        if (!res.success) {
          setLocalError(res.error || t('onboarding.account.signUpFailed', 'Failed to create account.'))
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLocalError(null)
    setIsGoogleLoading(true)
    try {
      const res = await signInWithGoogle()
      if (!res.success) {
        setLocalError(res.error || 'Google sign in failed')
      }
    } finally {
      setIsGoogleLoading(false)
    }
  }

  // ── Post-login confirmation ──
  if (user) {
    const { isCloudPro: isPro } = useLiteDaemonUsage()

    return (
      <div className="max-w-[320px] mx-auto flex flex-col items-center gap-5 py-4 animate-in fade-in duration-300">
        <motion.div
          className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
          <CheckCircle2 size={32} className="text-emerald-500" />
        </motion.div>

        <div className="text-center">
          <p className="text-[13px] text-text-secondary">{t('onboarding.account.signedInAs')}</p>
          <p className="text-[15px] font-semibold text-text-primary mt-0.5 truncate max-w-[280px]">
            {user.email}
          </p>
        </div>

        <div className="bg-bg-secondary border border-border rounded-[14px] p-4 w-full">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[10px] bg-accent/10 flex items-center justify-center shrink-0">
              {isPro ? (
                <Sparkles size={18} className="text-emerald-500" />
              ) : (
                <UserCircle size={18} className="text-accent" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-text-primary flex items-center gap-1.5">
                <span>{isPro ? 'LiteDaemon Pro' : 'LiteDaemon Free'}</span>
                {isPro && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-medium border border-emerald-500/20">
                    Active
                  </span>
                )}
              </p>
              <p className="text-[11px] text-text-secondary mt-0.5 leading-normal">
                {isPro
                  ? 'Managed speech recognition — no API keys needed.'
                  : 'Free forever — bring your own API keys.'}
              </p>
            </div>
          </div>
        </div>

        <p className="text-[12px] text-text-tertiary text-center">
          Click <strong>Next</strong> to configure your speech & AI setup.
        </p>
      </div>
    )
  }

  // ── Sign In / Sign Up Form ──
  return (
    <div className="max-w-[300px] mx-auto space-y-4 py-1">
      {/* Hero Icon */}
      <div className="flex justify-center">
        <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
          <UserCircle size={26} className="text-accent" />
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex border border-border rounded-[10px] overflow-hidden bg-bg-secondary/40 p-0.5">
        <button
          onClick={() => {
            setTab('signin')
            setLocalError(null)
          }}
          className={`flex-1 py-1.5 text-[12px] font-medium rounded-[8px] border-none cursor-pointer transition-all ${
            tab === 'signin'
              ? 'bg-bg-primary text-text-primary shadow-sm'
              : 'bg-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {t('onboarding.account.signIn')}
        </button>
        <button
          onClick={() => {
            setTab('signup')
            setLocalError(null)
          }}
          className={`flex-1 py-1.5 text-[12px] font-medium rounded-[8px] border-none cursor-pointer transition-all ${
            tab === 'signup'
              ? 'bg-bg-primary text-text-primary shadow-sm'
              : 'bg-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {t('onboarding.account.signUp')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            {t('onboarding.account.email')}
          </label>
          <input
            type="email"
            placeholder={t('onboarding.account.emailPlaceholder', 'your@email.com')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-[10px] text-[13px] text-text-primary outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        <div>
          <label className="block text-[12px] font-medium text-text-secondary mb-1">
            {t('onboarding.account.password')}
          </label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-[10px] text-[13px] text-text-primary outline-none focus:border-accent transition-colors"
            required
          />
        </div>

        {tab === 'signup' && (
          <div>
            <label className="block text-[12px] font-medium text-text-secondary mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              className="w-full px-3 py-2 bg-bg-secondary border border-border rounded-[10px] text-[13px] text-text-primary outline-none focus:border-accent transition-colors"
              required
            />
          </div>
        )}

        {displayError && (
          <div className="flex items-start gap-1.5 p-2 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] leading-tight">
            <AlertCircle size={13} className="shrink-0 mt-0.5" />
            <span>{displayError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || loading}
          className="w-full py-2.5 rounded-[10px] bg-accent text-white text-[13px] font-medium cursor-pointer border-none hover:bg-accent-hover disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          {isSubmitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : tab === 'signin' ? (
            t('onboarding.account.signIn')
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex-1 h-px bg-border" />
        <span className="text-text-tertiary text-[11px] uppercase tracking-wider">
          {t('onboarding.account.or')}
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Google Sign In Button */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || loading}
        className="w-full py-2.5 rounded-[10px] border border-border bg-bg-secondary/60 hover:bg-bg-secondary text-text-primary text-[13px] font-medium cursor-pointer transition-colors flex items-center justify-center gap-2.5 shadow-sm"
      >
        {isGoogleLoading ? (
          <Loader2 size={14} className="animate-spin text-accent" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
        )}
        <span>{t('onboarding.account.continueWithGoogle')}</span>
      </button>
    </div>
  )
}
