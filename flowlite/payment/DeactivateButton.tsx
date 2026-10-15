/**
 * LiteDaemon — Deactivate Device Button
 * Shown in the app's Settings page so users can free their license slot.
 * Import this and drop it into the existing Settings component.
 *
 * Usage:
 *   import { DeactivateButton } from '../../LiteDaemon/payment/DeactivateButton'
 *   // Then in your settings JSX:
 *   <DeactivateButton onDeactivate={deactivate} isDeactivating={isDeactivating} />
 *
 * File location: /LiteDaemon/payment/DeactivateButton.tsx
 * Phase: 2 — Payment Gate
 */

interface DeactivateButtonProps {
  onDeactivate: () => Promise<void>
  isDeactivating: boolean
}

export function DeactivateButton({ onDeactivate, isDeactivating }: DeactivateButtonProps) {
  const handleClick = () => {
    const confirmed = window.confirm(
      'Deactivate LiteDaemon on this device?\n\nYour license key will be freed so you can use it on another computer. You will need to re-enter your key to use LiteDaemon on this device again.'
    )
    if (confirmed) onDeactivate()
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.info}>
        <span style={styles.label}>License</span>
        <span style={styles.desc}>Deactivate this device to use your license key elsewhere.</span>
      </div>
      <button
        id="deactivate-device-btn"
        style={{ ...styles.btn, ...(isDeactivating ? styles.btnDisabled : {}) }}
        onClick={handleClick}
        disabled={isDeactivating}
      >
        {isDeactivating ? 'Deactivating…' : 'Deactivate Device'}
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    borderTop: '1px solid #2E2E40',
    gap: '16px',
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  label: {
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 500,
  },
  desc: {
    color: '#606078',
    fontSize: '12px',
  },
  btn: {
    background: 'transparent',
    border: '1px solid rgba(239,68,68,0.4)',
    color: '#F87171',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  btnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
}
