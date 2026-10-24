// =============================================================================
// LiteDaemon Usage Bar
// LiteDaemon/ui/LiteDaemonUsageBar.tsx
//
// Shows weekly word usage for free users: "1,847 / 2,000 words used this week"
// Shows an upgrade prompt when the limit is hit.
// Shows nothing for Cloud Pro or BYOK users.
//
// Usage:
//   Import and render anywhere in the app — it reads from useLiteDaemonUsage
//   and renders itself only when relevant.
//
// Designed to match the existing LiteDaemon jelly-card aesthetic.
// =============================================================================

import { motion, AnimatePresence } from 'framer-motion'
import { Zap, ArrowRight, AlertTriangle, Sparkles } from 'lucide-react'
import { useLiteDaemonUsage, FREE_TIER_WEEKLY_WORD_LIMIT } from '../cloud/usageStore'
import { useRoute } from '../../src/lib/router'

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

/** Animated fill bar */
function UsageFillBar({ percent, isWarning, isDanger }: {
  percent: number
  isWarning: boolean
  isDanger: boolean
}) {
  const trackColor = 'rgba(255,255,255,0.06)'
  const fillColor = isDanger
    ? '#EF4444'
    : isWarning
    ? '#F59E0B'
    : '#3D5AFE'

  return (
    <div
      style={{
        height: 6,
        borderRadius: 99,
        background: trackColor,
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percent}%` }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          height: '100%',
          borderRadius: 99,
          background: isDanger
            ? 'linear-gradient(90deg, #EF4444, #DC2626)'
            : isWarning
            ? 'linear-gradient(90deg, #F59E0B, #D97706)'
            : 'linear-gradient(90deg, #3D5AFE, #6B80FF)',
          boxShadow: isDanger
            ? '0 0 8px rgba(239,68,68,0.5)'
            : isWarning
            ? '0 0 8px rgba(245,158,11,0.4)'
            : '0 0 8px rgba(61,90,254,0.5)',
        }}
      />
    </div>
  )
}

// -----------------------------------------------------------------------------
// Compact variant — shown inline in Settings / Account pane
// -----------------------------------------------------------------------------

export function LiteDaemonUsageBarCompact() {
  const {
    isFree,
    isCloudPro,
    isByokPro,
    wordsUsedThisWeek,
    usagePercent,
    isLimitReached,
    resetsOn,
    initialized,
  } = useLiteDaemonUsage()

  const { navigate } = useRoute()

  // Don't render for Pro users
  if (!initialized || isCloudPro || isByokPro) return null

  const isWarning = usagePercent >= 75 && !isLimitReached
  const isDanger = isLimitReached

  const formattedUsed = wordsUsedThisWeek.toLocaleString()
  const formattedLimit = FREE_TIER_WEEKLY_WORD_LIMIT.toLocaleString()

  const resetsDate = resetsOn
    ? new Date(resetsOn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : ''

  return (
    <AnimatePresence>
      <motion.div
        key="usage-bar-compact"
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
        style={{
          borderRadius: 14,
          padding: '12px 14px',
          background: isDanger
            ? 'rgba(239,68,68,0.06)'
            : isWarning
            ? 'rgba(245,158,11,0.06)'
            : 'rgba(255,255,255,0.04)',
          border: `1px solid ${
            isDanger
              ? 'rgba(239,68,68,0.2)'
              : isWarning
              ? 'rgba(245,158,11,0.2)'
              : 'rgba(255,255,255,0.08)'
          }`,
        }}
      >
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isDanger ? (
              <AlertTriangle size={13} style={{ color: '#EF4444' }} />
            ) : (
              <Zap size={13} style={{ color: isWarning ? '#F59E0B' : '#3D5AFE' }} />
            )}
            <span
              style={{
                fontSize: 12,
                fontWeight: 500,
                color: isDanger ? '#EF4444' : isWarning ? '#F59E0B' : 'var(--text-secondary, #A0A0B8)',
              }}
            >
              {isDanger ? 'Weekly limit reached' : 'Free words used'}
            </span>
          </div>

          <span style={{ fontSize: 11, color: 'var(--text-muted, #606078)' }}>
            Resets {resetsDate}
          </span>
        </div>

        {/* Fill bar */}
        <UsageFillBar
          percent={usagePercent}
          isWarning={isWarning}
          isDanger={isDanger}
        />

        {/* Count row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary, #A0A0B8)' }}>
            <span style={{ fontWeight: 600, color: isDanger ? '#EF4444' : 'var(--text-primary, #fff)' }}>
              {formattedUsed}
            </span>
            {' / '}
            {formattedLimit} words
          </span>

          {/* Upgrade CTA — shown at 75%+ */}
          {(isWarning || isDanger) && (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('upgrade')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 11,
                fontWeight: 600,
                color: isDanger ? '#EF4444' : '#F59E0B',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              Upgrade
              <ArrowRight size={11} />
            </motion.button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

// -----------------------------------------------------------------------------
// Full banner variant — shown when limit is hit (blocks dictation)
// -----------------------------------------------------------------------------

export function LiteDaemonLimitBanner() {
  const { isFree, isLimitReached, resetsOn, initialized } = useLiteDaemonUsage()
  const { navigate } = useRoute()

  if (!initialized || !isFree || !isLimitReached) return null

  const resetsDate = resetsOn
    ? new Date(resetsOn).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })
    : 'next Monday'

  return (
    <AnimatePresence>
      <motion.div
        key="limit-banner"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          borderRadius: 16,
          padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.06) 100%)',
          border: '1px solid rgba(239,68,68,0.25)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Icon + heading */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: 'rgba(239,68,68,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={18} style={{ color: '#EF4444' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#EF4444' }}>
              Free limit reached
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary, #A0A0B8)', lineHeight: 1.5 }}>
              You've used all {FREE_TIER_WEEKLY_WORD_LIMIT.toLocaleString()} free words this week.
              Resets {resetsDate}.
            </p>
          </div>
        </div>

        {/* Upgrade button */}
        <motion.button
          whileHover={{ scale: 1.02, brightness: 1.05 } as any}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('upgrade')}
          style={{
            marginTop: 14,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '9px 0',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #3D5AFE 0%, #6B80FF 100%)',
            border: 'none',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 600,
            color: '#fff',
            boxShadow: '0 4px 16px rgba(61,90,254,0.35)',
          }}
        >
          <Sparkles size={14} />
          Upgrade to Pro — Unlimited Dictation
          <ArrowRight size={14} />
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}

// -----------------------------------------------------------------------------
// Default export — smart wrapper that picks compact or banner variant
// Render this once in the Account tab / Settings pane
// -----------------------------------------------------------------------------

export function LiteDaemonUsageBar() {
  const { isFree, isLimitReached, initialized } = useLiteDaemonUsage()

  if (!initialized || !isFree) return null

  return isLimitReached ? <LiteDaemonLimitBanner /> : <LiteDaemonUsageBarCompact />
}
