/**
 * LiteDaemon — Dodo Payments License Store
 * Handles saving and reading the license key + instance ID from OS secure storage.
 *
 * Uses Tauri's plugin-store (already in the project) to persist data securely.
 * No sensitive keys are ever logged or exposed to the UI unnecessarily.
 *
 * File location: /LiteDaemon/payment/licenseStore.ts
 * Phase: 2 — Payment Gate
 */

import { load } from '@tauri-apps/plugin-store'

const STORE_FILE = 'LiteDaemon-license.bin'
const KEY_LICENSE     = 'license_key'
const KEY_INSTANCE    = 'instance_id'
const KEY_PLAN        = 'plan_type'
const KEY_LAST_VALID  = 'last_validated_at'

export type PlanType = 'byok_india' | 'byok_global' | 'cloud_india' | 'cloud_global'

export interface LicenseData {
  licenseKey: string
  instanceId: string
  planType: PlanType
  lastValidatedAt: number // unix timestamp ms
}

async function getStore() {
  return await load(STORE_FILE, { autoSave: true, defaults: {} })
}

/** Save license data after a successful activation */
export async function saveLicense(data: LicenseData): Promise<void> {
  const store = await getStore()
  await store.set(KEY_LICENSE,    data.licenseKey)
  await store.set(KEY_INSTANCE,   data.instanceId)
  await store.set(KEY_PLAN,       data.planType)
  await store.set(KEY_LAST_VALID, data.lastValidatedAt)
}

/** Read saved license data — returns null if no license saved */
export async function readLicense(): Promise<LicenseData | null> {
  const store = await getStore()
  const licenseKey    = await store.get<string>(KEY_LICENSE)
  const instanceId    = await store.get<string>(KEY_INSTANCE)
  const planType      = await store.get<PlanType>(KEY_PLAN)
  const lastValidatedAt = await store.get<number>(KEY_LAST_VALID)

  if (!licenseKey || !instanceId || !planType) return null

  return {
    licenseKey,
    instanceId,
    planType,
    lastValidatedAt: lastValidatedAt ?? 0,
  }
}

/** Wipe license data — used when deactivating the device */
export async function clearLicense(): Promise<void> {
  const store = await getStore()
  await store.delete(KEY_LICENSE)
  await store.delete(KEY_INSTANCE)
  await store.delete(KEY_PLAN)
  await store.delete(KEY_LAST_VALID)
}

/** Update the last-validated timestamp — called after each successful validation */
export async function updateLastValidated(): Promise<void> {
  const store = await getStore()
  await store.set(KEY_LAST_VALID, Date.now())
}

/**
 * Check if we're within the offline grace period (7 days).
 * If the user hasn't been online in 7+ days, we require a fresh validation.
 */
export function isWithinGracePeriod(lastValidatedAt: number): boolean {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000
  return Date.now() - lastValidatedAt < SEVEN_DAYS_MS
}
