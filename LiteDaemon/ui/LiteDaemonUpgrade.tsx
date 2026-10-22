import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { openUrl } from '@tauri-apps/plugin-opener'
import {
  Check,
  ExternalLink,
  Sparkles,
  Zap,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  User,
} from 'lucide-react'
import { spring } from '../../src/lib/animations'
import { useSupabaseAuth } from '../auth/useSupabaseAuth'

type Region = 'india' | 'global'
type Cycle = 'monthly' | 'annual'

// Dodo Payments Live Hosted Checkout URLs
const CHECKOUT_URLS = {
  byok: {
    india: {
      monthly: 'https://checkout.dodopayments.com/buy/pdt_0Nq1FwtH5b6kZwUUltVpV',
      annual: 'https://checkout.dodopayments.com/buy/pdt_0Nq1GZ0tpiOdOzJV3Ai1Y',
    },
    global: {
      monthly: 'https://checkout.dodopayments.com/buy/pdt_0Nq1I8tfZuKu3QR4Zd8et',
      annual: 'https://checkout.dodopayments.com/buy/pdt_0Nq1IWgNwfCebIPUT5z1s',
    },
  },
  cloud: {
    india: {
      monthly: 'https://checkout.dodopayments.com/buy/pdt_0Nq1H1dHTZzfrQ1tdeYCP',
      annual: 'https://checkout.dodopayments.com/buy/pdt_0Nq1Hjj1bZUR5HQ9hgraU',
    },
    global: {
      monthly: 'https://checkout.dodopayments.com/buy/pdt_0Nq1IsTBvSZVraoe1aXnz',
      annual: 'https://checkout.dodopayments.com/buy/pdt_0Nq1JGEZBp3f6bfs9CnE2',
    },
  },
}

const DODO_CUSTOMER_PORTAL = 'https://customer.dodopayments.com'

function detectInitialRegion(): Region {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase()
    if (
      tz.includes('calcutta') ||
      tz.includes('kolkata') ||
      tz.includes('india') ||
      tz.includes('ist')
    ) {
      return 'india'
    }
    const languages = navigator.languages || [navigator.language]
    if (languages.some((l) => l.toLowerCase().endsWith('-in') || l.toLowerCase() === 'hi')) {
      return 'india'
    }
  } catch (e) {
    // ignore
  }
  return 'global'
}

export function LiteDaemonUpgrade() {
  const { user, profile, initialize } = useSupabaseAuth()
  const [region, setRegion] = useState<Region>(detectInitialRegion)
  const [cycle, setCycle] = useState<Cycle>('monthly')

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    // Silent background country lookup with fast timeout
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2500)

    fetch('https://api.country.is/', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data?.country === 'IN') {
          setRegion('india')
        } else if (data?.country) {
          setRegion('global')
        }
      })
      .catch(() => {
        // Fallback to timezone/locale detection already active
      })
      .finally(() => clearTimeout(timer))

    return () => clearTimeout(timer)
  }, [])

  const isPro = profile?.plan === 'pro' || profile?.plan === 'lifetime'

  const handleOpenUrl = (url: string) => {
    openUrl(url).catch((err) => console.error('Failed to open URL:', err))
  }

  const handleCheckout = (url: string) => {
    const finalUrl = user?.email
      ? `${url}?email=${encodeURIComponent(user.email)}`
      : url
    handleOpenUrl(finalUrl)
  }

  return (
    <div className="max-w-[640px] mx-auto py-7 px-6 text-[13px] text-text-primary space-y-6">
      {/* Header */}
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[20px] font-semibold text-text-primary tracking-tight">
            Subscription & Plans
          </h1>
          <p className="mt-1 text-[13px] text-text-secondary leading-5">
            {isPro
              ? 'Your LiteDaemon Pro membership is active. Manage billing and features.'
              : 'Pick the plan that fits your typing flow. Instant cloud setup, zero friction.'}
          </p>
        </div>

        {isPro ? (
          <div className="flex items-center gap-1.5 shrink-0 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500 px-3 py-1 rounded-full text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Pro Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 shrink-0 bg-bg-secondary border border-border text-text-tertiary px-3 py-1 rounded-full text-[12px] font-medium">
            <span className="w-2 h-2 rounded-full bg-neutral-400" />
            <span>Free Starter</span>
          </div>
        )}
      </header>

      {/* Active Subscription Banner for Pro Users */}
      {isPro ? (
        <section className="rounded-[20px] p-6 jelly-card border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.04] to-bg-secondary/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-5 border-b border-border/80">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-500" />
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Current Membership
                </span>
              </div>
              <h2 className="text-[18px] font-bold text-text-primary flex items-center gap-2">
                <span>LiteDaemon Pro</span>
                <span className="text-[12px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Unlimited
                </span>
              </h2>
              <div className="flex items-center gap-2 text-[12px] text-text-secondary">
                <User size={13} className="text-text-tertiary" />
                <span>{user?.email || 'Cloud Account'}</span>
              </div>
            </div>

            <motion.button
              onClick={() => handleOpenUrl(DODO_CUSTOMER_PORTAL)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scaleX: 1.05, scaleY: 0.95 }}
              transition={spring.jellyGentle}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] bg-bg-primary hover:bg-bg-tertiary border border-border text-text-primary text-[12px] font-medium cursor-pointer transition-colors shrink-0 shadow-sm"
            >
              <CreditCard size={14} className="text-accent" />
              <span>Manage Invoices on Dodo</span>
              <ExternalLink size={12} className="text-text-tertiary" />
            </motion.button>
          </div>

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px] text-text-secondary">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>Unlimited Voice-to-Text Dictation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>Cloud Whisper Speech Recognition</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>AI Grammar Polish & Intelligent Formatting</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
              <span>Custom Vocabulary & Scene Prompts</span>
            </div>
          </div>
        </section>
      ) : null}

      {/* Available Plans Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary">
              {isPro ? 'Switch Plan or Billing Period' : 'Available Plans'}
            </h3>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              Pricing shown in {region === 'india' ? 'INR (₹)' : 'USD ($)'} based on your region.{' '}
              <button
                onClick={() => setRegion(region === 'india' ? 'global' : 'india')}
                className="text-accent hover:underline bg-transparent border-none p-0 cursor-pointer font-medium"
              >
                Switch to {region === 'india' ? 'USD ($)' : 'INR (₹)'}
              </button>
            </p>
          </div>

          {/* Cycle Toggle (Monthly vs Annual) */}
          <div className="flex items-center p-0.5 rounded-full bg-bg-secondary border border-border relative self-start sm:self-center">
            <button
              onClick={() => setCycle('monthly')}
              className={`relative z-10 px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer border-none bg-transparent ${
                cycle === 'monthly' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cycle === 'monthly' && (
                <motion.div
                  layoutId="upgrade-cycle-pill"
                  className="absolute inset-0 rounded-full bg-bg-tertiary border border-border shadow-sm"
                  transition={spring.jellyGentle}
                />
              )}
              <span className="relative z-20">Monthly</span>
            </button>
            <button
              onClick={() => setCycle('annual')}
              className={`relative z-10 px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer border-none bg-transparent ${
                cycle === 'annual' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {cycle === 'annual' && (
                <motion.div
                  layoutId="upgrade-cycle-pill"
                  className="absolute inset-0 rounded-full bg-bg-tertiary border border-border shadow-sm"
                  transition={spring.jellyGentle}
                />
              )}
              <span className="relative z-20">Annual (Save 25–33%)</span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid gap-4 min-[600px]:grid-cols-2">
          {/* LiteDaemon Cloud Card */}
          <div className="rounded-[18px] p-5 jelly-card border border-accent/40 flex flex-col justify-between relative overflow-hidden bg-bg-secondary/40 shadow-sm">
            <div className="absolute top-0 right-0 bg-accent text-white px-3 py-0.5 text-[10px] font-semibold rounded-bl-[12px] tracking-wide">
              RECOMMENDED
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-[8px] bg-accent/15 flex items-center justify-center text-accent">
                  <Sparkles size={15} />
                </div>
                <h4 className="text-[15px] font-semibold text-text-primary">LiteDaemon Cloud</h4>
              </div>

              <div className="mt-3 mb-2 flex items-baseline gap-1">
                <span className="text-[26px] font-bold text-text-primary">
                  {region === 'india'
                    ? cycle === 'monthly'
                      ? '₹400'
                      : '₹3,849'
                    : cycle === 'monthly'
                      ? '$15'
                      : '$144'}
                </span>
                <span className="text-[12px] text-text-secondary">
                  / {cycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
                Managed high-speed speech recognition. Speak to type instantly without needing any
                API keys or setup.
              </p>

              <ul className="space-y-2 mb-5 text-[12px] text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent shrink-0" />
                  <span>No API keys required</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent shrink-0" />
                  <span>Cloud Whisper speech recognition</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent shrink-0" />
                  <span>AI grammar polish & rewriting</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent shrink-0" />
                  <span>Priority low-latency transcription</span>
                </li>
              </ul>
            </div>

            <motion.button
              onClick={() => handleCheckout(CHECKOUT_URLS.cloud[region][cycle])}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scaleX: 1.04, scaleY: 0.96 }}
              transition={spring.jellyGentle}
              className="w-full py-2.5 px-4 rounded-full bg-accent hover:bg-accent-hover text-white text-[13px] font-medium flex items-center justify-center gap-2 border-none cursor-pointer transition-colors shadow-sm"
            >
              <span>{isPro ? 'Switch to Cloud' : 'Upgrade to Cloud'}</span>
              <ArrowRight size={14} />
            </motion.button>
          </div>

          {/* LiteDaemon BYOK Card */}
          <div className="rounded-[18px] p-5 jelly-card border border-border flex flex-col justify-between bg-bg-secondary/20">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-[8px] bg-bg-secondary flex items-center justify-center text-text-secondary">
                  <Zap size={15} />
                </div>
                <h4 className="text-[15px] font-semibold text-text-primary">LiteDaemon BYOK</h4>
              </div>

              <div className="mt-3 mb-2 flex items-baseline gap-1">
                <span className="text-[26px] font-bold text-text-primary">
                  {region === 'india'
                    ? cycle === 'monthly'
                      ? '₹149'
                      : '₹1,199'
                    : cycle === 'monthly'
                      ? '$3.99'
                      : '$35'}
                </span>
                <span className="text-[12px] text-text-secondary">
                  / {cycle === 'monthly' ? 'month' : 'year'}
                </span>
              </div>

              <p className="text-[12px] text-text-secondary leading-relaxed mb-4">
                Bring your own API keys. Maximum flexibility and privacy using your favorite AI
                providers.
              </p>

              <ul className="space-y-2 mb-5 text-[12px] text-text-secondary">
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent shrink-0" />
                  <span>Groq, OpenAI, Gemini, Claude, Ollama</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent shrink-0" />
                  <span>Unlimited voice typing dictations</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent shrink-0" />
                  <span>100% on-device private processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={14} className="text-accent shrink-0" />
                  <span>Custom dictionary & app scene prompts</span>
                </li>
              </ul>
            </div>

            <motion.button
              onClick={() => handleCheckout(CHECKOUT_URLS.byok[region][cycle])}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scaleX: 1.04, scaleY: 0.96 }}
              transition={spring.jellyGentle}
              className="w-full py-2.5 px-4 rounded-full bg-bg-tertiary hover:bg-bg-secondary text-text-primary border border-border text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <span>{isPro ? 'Switch to BYOK' : 'Get BYOK Plan'}</span>
              <ArrowRight size={14} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Feature summary row */}
      <section className="rounded-[16px] p-4 jelly-card border border-border bg-bg-secondary/30">
        <h4 className="text-[12px] font-semibold text-text-primary mb-3">
          Every LiteDaemon subscription includes:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px] text-text-secondary">
          <div className="flex items-center gap-2">
            <Check size={14} className="text-accent" />
            <span>Windows, Mac & Linux support</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-accent" />
            <span>100+ Dictation Languages</span>
          </div>
          <div className="flex items-center gap-2">
            <Check size={14} className="text-accent" />
            <span>Lightweight footprint (~50MB RAM)</span>
          </div>
        </div>
      </section>
    </div>
  )
}
