/**
 * LiteDaemon — Dodo Payments API Client
 * Handles license activation, validation, and deactivation via Dodo Payments public API.
 *
 * These endpoints are PUBLIC — no secret key needed in the client app.
 * Test mode: https://test.dodopayments.com
 * Live mode:  https://live.dodopayments.com
 *
 * File location: /LiteDaemon/payment/dodopayments.ts
 * Phase: 2 — Payment Gate
 */

// Uses native fetch (available in Tauri webview — no plugin needed for HTTPS)
import type { PlanType } from './licenseStore'


// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Toggle this to false before shipping to production
const TEST_MODE = true
const BASE_URL = TEST_MODE
  ? 'https://test.dodopayments.com'
  : 'https://live.dodopayments.com'

// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface ActivateResult {
  success: boolean
  instanceId?: string
  planType?: PlanType
  error?: string
}

export interface ValidateResult {
  valid: boolean
  error?: string
}

export interface DeactivateResult {
  success: boolean
  error?: string
}

// ─── MACHINE ID ──────────────────────────────────────────────────────────────
/**
 * Generates a stable anonymous machine identifier.
 * Uses browser fingerprinting as a proxy — good enough for desktop.
 * Not perfect anti-piracy but prevents accidental duplicate activations.
 */
function getMachineId(): string {
  const key = 'LiteDaemon_machine_id'
  let id = localStorage.getItem(key)
  if (!id) {
    // Generate a random stable ID for this machine
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

// ─── PLAN DETECTION ──────────────────────────────────────────────────────────
/**
 * Dodo Payments returns product/variant info in the activation response.
 * We map their product ID back to our plan type.
 *
 * IMPORTANT: Replace these placeholder IDs with your actual Dodo Payments
 * product IDs once you create the products in your dashboard.
 */
const PRODUCT_ID_TO_PLAN: Record<string, PlanType> = {
  // TODO: Replace with your actual Dodo Payments Product IDs
  // Format: 'prd_xxxxxxxxxxxx': 'plan_type'
  'BYOK_INDIA_PRODUCT_ID':   'byok_india',
  'BYOK_GLOBAL_PRODUCT_ID':  'byok_global',
  'CLOUD_INDIA_PRODUCT_ID':  'cloud_india',
  'CLOUD_GLOBAL_PRODUCT_ID': 'cloud_global',
}

function detectPlanFromResponse(responseData: unknown): PlanType {
  // Try to extract product ID from Dodo response and map to our plan type
  const data = responseData as Record<string, unknown>
  const productId = (data?.license_key as Record<string, unknown>)?.product_id as string
  return PRODUCT_ID_TO_PLAN[productId] ?? 'byok_global' // default fallback
}

// ─── API CALLS ───────────────────────────────────────────────────────────────

/**
 * Activate a license key on this device.
 * Called once when the user enters their key for the first time.
 */
export async function activateLicense(licenseKey: string): Promise<ActivateResult> {
  try {
    const machineId = getMachineId()

    const response = await fetch(`${BASE_URL}/v1/licenses/activate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey.trim(),
        name: `LiteDaemon-${machineId.slice(0, 8)}`, // instance name shown in dashboard
      }),
    })

    const data = await response.json() as Record<string, unknown>

    if (!response.ok) {
      const errMsg = (data?.message as string) || (data?.error as string) || 'Activation failed'
      return { success: false, error: errMsg }
    }

    const activated = data?.activated as boolean
    if (!activated) {
      return { success: false, error: (data?.message as string) ?? 'License key is invalid or already activated on another device.' }
    }

    const instance = data?.instance as Record<string, unknown>
    const instanceId = instance?.id as string

    return {
      success: true,
      instanceId,
      planType: detectPlanFromResponse(data),
    }
  } catch (err) {
    console.error('[LiteDaemon] License activation error:', err)
    return { success: false, error: 'Could not connect to the licensing server. Check your internet connection.' }
  }
}

/**
 * Validate that an existing license+instance is still active.
 * Called every time the app starts (silent, background check).
 */
export async function validateLicense(
  licenseKey: string,
  instanceId: string,
): Promise<ValidateResult> {
  try {
    const response = await fetch(`${BASE_URL}/v1/licenses/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey,
        license_key_instance_id: instanceId,
      }),
    })

    const data = await response.json() as Record<string, unknown>

    if (!response.ok) {
      return { valid: false, error: (data?.message as string) ?? 'Validation failed' }
    }

    const valid = data?.valid as boolean
    const status = (data?.license_key as Record<string, unknown>)?.status as string

    if (!valid || status === 'expired' || status === 'disabled') {
      return { valid: false, error: `License is ${status ?? 'invalid'}. Please renew your subscription.` }
    }

    return { valid: true }
  } catch (err) {
    // Network error — let the caller decide based on grace period
    console.warn('[LiteDaemon] License validation network error:', err)
    return { valid: false, error: 'offline' }
  }
}

/**
 * Deactivate this device's license instance.
 * Called from Settings → "Deactivate this device".
 * Frees up an activation slot so the user can use the key on another machine.
 */
export async function deactivateLicense(
  licenseKey: string,
  instanceId: string,
): Promise<DeactivateResult> {
  try {
    const response = await fetch(`${BASE_URL}/v1/licenses/deactivate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        license_key: licenseKey,
        license_key_instance_id: instanceId,
      }),
    })

    const data = await response.json() as Record<string, unknown>

    if (!response.ok) {
      return { success: false, error: (data?.message as string) ?? 'Deactivation failed' }
    }

    return { success: true }
  } catch (err) {
    console.error('[LiteDaemon] License deactivation error:', err)
    return { success: false, error: 'Could not connect to the licensing server.' }
  }
}
