import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { openUrl } from '@tauri-apps/plugin-opener'
import {
  Check,
  ExternalLink,
  Copy,
  CheckCheck,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  CreditCard,
} from 'lucide-react'
import { spring } from '../../src/lib/animations'
import { readLicense, type LicenseData, type PlanType } from '../payment/licenseStore'

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

export function LiteDaemonUpgrade() {
  const [license, setLicense] = useState<LicenseData | null>(null)
  const [region, setRegion] = useState<Region>('india')
  const [cycle, setCycle] = useState<Cycle>('monthly')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    readLicense().then((data) => {
      if (data) {
        setLicense(data)
        if (data.planType?.includes('global')) {
          setRegion('global')
        } else if (data.planType?.includes('india')) {
          setRegion('india')
        }
      }
    })
  }, [])

  const handleCopyKey = () => {
    if (!license?.licenseKey) return
    navigator.clipboard.writeText(license.licenseKey).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleOpenUrl = (url: string) => {
    openUrl(url).catch((err) => console.error('Failed to open URL:', err))
  }

  const getPlanDisplayName = (type?: PlanType) => {
    switch (type) {
      case 'byok_india':
        return 'LiteDaemon BYOK (India)'
      case 'byok_global':
        return 'LiteDaemon BYOK (Global)'
      case 'cloud_india':
        return 'LiteDaemon Cloud (India)'
      case 'cloud_global':
        return 'LiteDaemon Cloud (Global)'
      default:
        return 'LiteDaemon Active'
    }
  }

  const maskLicenseKey = (key?: string) => {
    if (!key) return '••••-••••-••••-••••'
    if (key.length <= 12) return key
    return `${key.slice(0, 8)}••••-••••-${key.slice(-4)}`
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
            Manage your active LiteDaemon license, billing portal, and upgrade options.
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 bg-accent/10 border border-accent/25 text-accent px-3 py-1 rounded-full text-[12px] font-medium">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>Licensed</span>
        </div>
      </header>

      {/* Active License Card */}
      <section className="rounded-[18px] p-5 jelly-card border border-border bg-bg-secondary/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-accent" />
              <span className="text-[11px] font-semibold text-text-tertiary uppercase tracking-wider">
                Current Subscription
              </span>
            </div>
            <h2 className="text-[16px] font-semibold text-text-primary">
              {getPlanDisplayName(license?.planType)}
            </h2>
            <div className="flex items-center gap-2 text-[12px] text-text-secondary font-mono mt-1">
              <span>{maskLicenseKey(license?.licenseKey)}</span>
              {license?.licenseKey && (
                <button
                  onClick={handleCopyKey}
                  title="Copy License Key"
                  className="p-1 rounded-[6px] hover:bg-bg-tertiary text-text-tertiary hover:text-accent transition-colors bg-transparent border-none cursor-pointer"
                >
                  {copied ? (
                    <CheckCheck size={13} className="text-accent" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              )}
              {copied && <span className="text-[11px] text-accent font-sans">Copied!</span>}
            </div>
          </div>

          <motion.button
            onClick={() => handleOpenUrl(DODO_CUSTOMER_PORTAL)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scaleX: 1.05, scaleY: 0.95 }}
            transition={spring.jellyGentle}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] bg-bg-tertiary hover:bg-bg-secondary border border-border text-text-primary text-[12px] font-medium cursor-pointer transition-colors shrink-0"
          >
            <CreditCard size={14} className="text-accent" />
            <span>Manage Invoices on Dodo</span>
            <ExternalLink size={12} className="text-text-tertiary" />
          </motion.button>
        </div>
      </section>

      {/* Toggles */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
        <h3 className="text-[13px] font-semibold text-text-primary self-start sm:self-center">
          Available Plans & Upgrades
        </h3>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Region Toggle */}
          <div className="flex items-center p-0.5 rounded-full bg-bg-secondary border border-border relative">
            <button
              onClick={() => setRegion('india')}
              className={`relative z-10 px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer border-none bg-transparent ${
                region === 'india' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {region === 'india' && (
                <motion.div
                  layoutId="upgrade-region-pill"
                  className="absolute inset-0 rounded-full bg-bg-tertiary border border-border shadow-sm"
                  transition={spring.jellyGentle}
                />
              )}
              <span className="relative z-20">🇮🇳 India (₹)</span>
            </button>
            <button
              onClick={() => setRegion('global')}
              className={`relative z-10 px-3 py-1 text-[11px] font-medium transition-colors cursor-pointer border-none bg-transparent ${
                region === 'global' ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {region === 'global' && (
                <motion.div
                  layoutId="upgrade-region-pill"
                  className="absolute inset-0 rounded-full bg-bg-tertiary border border-border shadow-sm"
                  transition={spring.jellyGentle}
                />
              )}
              <span className="relative z-20">🌐 Global ($)</span>
            </button>
          </div>

          {/* Cycle Toggle */}
          <div className="flex items-center p-0.5 rounded-full bg-bg-secondary border border-border relative">
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
              <span className="relative z-20">Annual (Save 25%)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-4 min-[600px]:grid-cols-2">
        {/* LiteDaemon Cloud Card */}
        <div className="rounded-[18px] p-5 jelly-card border border-accent/35 flex flex-col justify-between relative overflow-hidden">
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
              Managed voice recognition with zero setup. Speak to type instantly without needing any
              API keys.
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
                <span>Priority high-speed transcription</span>
              </li>
            </ul>
          </div>

          <motion.button
            onClick={() => handleOpenUrl(CHECKOUT_URLS.cloud[region][cycle])}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scaleX: 1.04, scaleY: 0.96 }}
            transition={spring.jellyGentle}
            className="w-full py-2.5 px-4 rounded-full bg-accent hover:bg-accent-hover text-white text-[13px] font-medium flex items-center justify-center gap-2 border-none cursor-pointer transition-colors shadow-sm"
          >
            <span>Upgrade to Cloud</span>
            <ArrowRight size={14} />
          </motion.button>
        </div>

        {/* LiteDaemon BYOK Card */}
        <div className="rounded-[18px] p-5 jelly-card border border-border flex flex-col justify-between">
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
            onClick={() => handleOpenUrl(CHECKOUT_URLS.byok[region][cycle])}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scaleX: 1.04, scaleY: 0.96 }}
            transition={spring.jellyGentle}
            className="w-full py-2.5 px-4 rounded-full bg-bg-tertiary hover:bg-bg-secondary text-text-primary border border-border text-[13px] font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <span>{cycle === 'annual' ? 'Switch to Annual' : 'Renew / Switch Plan'}</span>
            <ArrowRight size={14} />
          </motion.button>
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
            <span>7-day offline grace period</span>
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
