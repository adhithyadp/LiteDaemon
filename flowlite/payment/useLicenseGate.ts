/**
 * FlowLite — License Gate Hook
 * The core logic that decides whether to show the app or the paywall.
 *
 * Flow:
 *   1. Read saved license from disk
 *   2. If no license → show activation screen
 *   3. If license found → validate online
 *   4. If offline → check grace period (7 days)
 *   5. If valid → let user in
 *   6. If expired/invalid → show activation screen with error
 *
 * File location: /flowlite/payment/useLicenseGate.ts
 * Phase: 2 — Payment Gate
 */

import { useState, useEffect, useCallback } from 'react'
import {
  readLicense,
  saveLicense,
  clearLicense,
  updateLastValidated,
  isWithinGracePeriod,
  type LicenseData,
  type PlanType,
} from './licenseStore'
import {
  activateLicense,
  validateLicense,
  deactivateLicense,
} from './dodopayments'

export type GateStatus =
  | 'checking'      // app is checking license on startup
  | 'unlocked'      // valid license — show the app
  | 'locked'        // no valid license — show activation screen
  | 'error'         // license was found but is now invalid/expired

export interface LicenseGateState {
  status: GateStatus
  planType: PlanType | null
  error: string | null
  isActivating: boolean
  isDeactivating: boolean
  /** Call this with the user's license key to activate */
  activate: (key: string) => Promise<void>
  /** Call this from Settings to deactivate and free the slot */
  deactivate: () => Promise<void>
  /** Dismiss the error and go back to the input screen */
  resetError: () => void
}

export function useLicenseGate(): LicenseGateState {
  const [status, setStatus]               = useState<GateStatus>('checking')
  const [planType, setPlanType]           = useState<PlanType | null>(null)
  const [error, setError]                 = useState<string | null>(null)
  const [isActivating, setIsActivating]   = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [licenseData, setLicenseData]     = useState<LicenseData | null>(null)

  // ── Startup check ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function checkLicense() {
      const saved = await readLicense()

      if (!saved) {
        // No license on disk → show paywall
        setStatus('locked')
        return
      }

      // License found — try to validate online
      const result = await validateLicense(saved.licenseKey, saved.instanceId)

      if (result.valid) {
        // ✅ Valid — let user in
        await updateLastValidated()
        setLicenseData(saved)
        setPlanType(saved.planType)
        setStatus('unlocked')
        return
      }

      if (result.error === 'offline') {
        // Network error — check grace period
        if (isWithinGracePeriod(saved.lastValidatedAt)) {
          // Within 7 days — allow offline use
          setLicenseData(saved)
          setPlanType(saved.planType)
          setStatus('unlocked')
          return
        } else {
          // Grace period expired — require online validation
          setError('Your license could not be verified. Please connect to the internet to continue.')
          setStatus('error')
          return
        }
      }

      // License is expired or revoked
      setError(result.error ?? 'Your license is no longer active. Please renew your subscription.')
      setStatus('error')
    }

    checkLicense()
  }, [])

  // ── Activate ───────────────────────────────────────────────────────────────
  const activate = useCallback(async (key: string) => {
    setIsActivating(true)
    setError(null)

    const result = await activateLicense(key)

    if (!result.success) {
      setError(result.error ?? 'Activation failed. Please check your license key and try again.')
      setIsActivating(false)
      return
    }

    const newLicense: LicenseData = {
      licenseKey: key.trim(),
      instanceId: result.instanceId!,
      planType: result.planType ?? 'byok_global',
      lastValidatedAt: Date.now(),
    }

    await saveLicense(newLicense)
    setLicenseData(newLicense)
    setPlanType(newLicense.planType)
    setIsActivating(false)
    setStatus('unlocked')
  }, [])

  // ── Deactivate ─────────────────────────────────────────────────────────────
  const deactivate = useCallback(async () => {
    if (!licenseData) return

    setIsDeactivating(true)

    const result = await deactivateLicense(licenseData.licenseKey, licenseData.instanceId)

    if (!result.success) {
      setError(result.error ?? 'Deactivation failed. Please try again.')
      setIsDeactivating(false)
      return
    }

    await clearLicense()
    setLicenseData(null)
    setPlanType(null)
    setIsDeactivating(false)
    setStatus('locked')
  }, [licenseData])

  // ── Reset error ────────────────────────────────────────────────────────────
  const resetError = useCallback(() => {
    setError(null)
    setStatus('locked')
  }, [])

  return {
    status,
    planType,
    error,
    isActivating,
    isDeactivating,
    activate,
    deactivate,
    resetError,
  }
}
