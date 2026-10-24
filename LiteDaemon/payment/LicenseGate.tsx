/**
 * LiteDaemon — License Gate Screen
 * The paywall UI shown when the app has no valid license.
 * Premium, minimal design matching our brand.
 *
 * File location: /LiteDaemon/payment/LicenseGate.tsx
 * Phase: 2 — Payment Gate
 */

import { useState } from 'react'
import type { GateStatus } from './useLicenseGate'

interface LicenseGateProps {
  status: GateStatus
  error: string | null
  isActivating: boolean
  onActivate: (key: string) => Promise<void>
  onResetError: () => void
}

export function LicenseGate({
  status,
  error,
  isActivating,
  onActivate,
  onResetError,
}: LicenseGateProps) {
  const [inputKey, setInputKey] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const handleActivate = async () => {
    const trimmed = inputKey.trim()
    if (!trimmed) {
      setLocalError('Please enter your license key.')
      return
    }
    setLocalError(null)
    await onActivate(trimmed)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleActivate()
  }

  const displayError = error ?? localError

  if (status === 'checking') {
    return (
      <div style={styles.root}>
        <div style={styles.card}>
          <div style={styles.spinner} />
          <p style={styles.checkingText}>Verifying license…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.root}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoCircle}>
            <WaveformIcon />
          </div>
        </div>

        {/* Headline */}
        <h1 style={styles.title}>LiteDaemon</h1>
        <p style={styles.subtitle}>
          Lightweight AI voice typing.<br />
          Less RAM. More flow.
        </p>

        {/* Error banner */}
        {displayError && (
          <div style={styles.errorBanner}>
            <span style={styles.errorText}>{displayError}</span>
          </div>
        )}

        {/* License input */}
        <div style={styles.inputWrap}>
          <input
            id="license-key-input"
            style={styles.input}
            type="text"
            placeholder="Enter your license key"
            value={inputKey}
            onChange={e => {
              setInputKey(e.target.value)
              if (localError) setLocalError(null)
              if (error) onResetError()
            }}
            onKeyDown={handleKeyDown}
            disabled={isActivating}
            autoFocus
            spellCheck={false}
          />
        </div>

        {/* Activate button */}
        <button
          id="activate-btn"
          style={{
            ...styles.button,
            ...(isActivating ? styles.buttonDisabled : {}),
          }}
          onClick={handleActivate}
          disabled={isActivating}
        >
          {isActivating ? (
            <span style={styles.btnInner}>
              <span style={styles.btnSpinner} /> Activating…
            </span>
          ) : (
            'Activate LiteDaemon'
          )}
        </button>

        {/* Buy link */}
        <p style={styles.buyText}>
          Don't have a license key?{' '}
          <a
            id="buy-link"
            href="https://litedaemon.xyz/#pricing"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.link}
          >
            Upgrade to LiteDaemon Cloud — or use BYOK free forever
          </a>
        </p>

        {/* Footer */}
        <p style={styles.footerText}>
          By activating, you agree to our{' '}
          <a href="https://litedaemon.xyz/terms" target="_blank" rel="noopener noreferrer" style={styles.linkMuted}>
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  )
}

// ─── SVG Waveform Icon ────────────────────────────────────────────────────────
function WaveformIcon() {
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4"  y="14" width="4" height="8"  rx="2" fill="white" />
      <rect x="10" y="9"  width="4" height="18" rx="2" fill="white" />
      <rect x="16" y="5"  width="4" height="26" rx="2" fill="white" />
      <rect x="22" y="9"  width="4" height="18" rx="2" fill="white" />
      <rect x="28" y="14" width="4" height="8"  rx="2" fill="white" />
    </svg>
  )
}

// ─── Styles (inline, no external CSS dependency) ─────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#0F0F12',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    background: '#1A1A24',
    border: '1px solid #2E2E40',
    borderRadius: '20px',
    padding: '40px 36px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
  },
  logoWrap: {
    marginBottom: '4px',
  },
  logoCircle: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3D5AFE, #2541E8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 32px rgba(61,90,254,0.4)',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '26px',
    fontWeight: 700,
    margin: '0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: '#A0A0B8',
    fontSize: '13px',
    margin: '0',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.12)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '10px',
    padding: '10px 14px',
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '4px',
  },
  errorText: {
    color: '#F87171',
    fontSize: '13px',
    lineHeight: 1.5,
  },
  inputWrap: {
    width: '100%',
    marginTop: '8px',
  },
  input: {
    width: '100%',
    background: '#22222F',
    border: '1.5px solid #2E2E40',
    borderRadius: '12px',
    padding: '12px 16px',
    color: '#FFFFFF',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
    transition: 'border-color 0.2s',
  },
  button: {
    width: '100%',
    background: 'linear-gradient(135deg, #3D5AFE, #2541E8)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    padding: '13px',
    fontSize: '15px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '4px',
    transition: 'opacity 0.2s, transform 0.1s',
    boxShadow: '0 4px 16px rgba(61,90,254,0.35)',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  btnInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  btnSpinner: {
    width: '14px',
    height: '14px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid #fff',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    display: 'inline-block',
  },
  buyText: {
    color: '#A0A0B8',
    fontSize: '13px',
    margin: '4px 0 0',
    textAlign: 'center',
  },
  link: {
    color: '#6B80FF',
    textDecoration: 'none',
    fontWeight: 500,
  },
  linkMuted: {
    color: '#606078',
    textDecoration: 'none',
  },
  footerText: {
    color: '#606078',
    fontSize: '11px',
    margin: '0',
    textAlign: 'center',
  },
  checkingText: {
    color: '#A0A0B8',
    fontSize: '14px',
    margin: '12px 0 0',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid rgba(61,90,254,0.2)',
    borderTop: '3px solid #3D5AFE',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
}
