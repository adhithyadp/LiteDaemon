# LiteDaemon — Payment System Documentation
> For any developer who needs to understand or modify the payment gate.

---

## Overview

LiteDaemon uses **Dodo Payments** for license key management.
Users buy a plan on the website → receive a license key by email → enter it in the app → app unlocks.

---

## Architecture

```
App Launch
    │
    ▼
useLicenseGate (hook)
    │
    ├─ readLicense() from licenseStore.ts
    │       │
    │       ├─ No license saved → show LicenseGate.tsx (paywall screen)
    │       │
    │       └─ License found → validateLicense() via dodopayments.ts
    │               │
    │               ├─ Valid → show MainApp ✅
    │               ├─ Offline + within 7-day grace → show MainApp ✅
    │               ├─ Offline + grace expired → show error screen ❌
    │               └─ Invalid/expired → show error screen ❌
    │
    └─ User enters key → activateLicense() → saveLicense() → show MainApp ✅
```

---

## Files

| File | Purpose |
|---|---|
| `LiteDaemon/payment/licenseStore.ts` | Read/write license key to OS secure storage |
| `LiteDaemon/payment/dodopayments.ts` | API calls: activate, validate, deactivate |
| `LiteDaemon/payment/useLicenseGate.ts` | Core logic hook — the brain |
| `LiteDaemon/payment/LicenseGate.tsx` | UI screen shown to unlicensed users |
| `LiteDaemon/payment/DeactivateButton.tsx` | "Deactivate this device" button for Settings |

---

## The ONE Line in Original Code

`src/App.tsx` has 3 lines added at the top (imports) and one function `GatedMainApp` added at the bottom.
That's the only touch. All comments in that file are marked `// [LiteDaemon]` for easy identification.

---

## Plans / Product IDs (Live Mode)

The mapping lives in `LiteDaemon/payment/dodopayments.ts` in the `PRODUCT_ID_TO_PLAN` object:

```typescript
export const PRODUCT_ID_TO_PLAN: Record<string, PlanType> = {
  // BYOK India
  'pdt_0Nq1FwtH5b6kZwUUltVpV': 'byok_india',  // Monthly (₹149)
  'pdt_0Nq1GZ0tpiOdOzJV3Ai1Y': 'byok_india',  // Annual (₹1,199)

  // BYOK Global
  'pdt_0Nq1I8tfZuKu3QR4Zd8et': 'byok_global', // Monthly ($3.99)
  'pdt_0Nq1IWgNwfCebIPUT5z1s': 'byok_global', // Annual ($35)

  // Cloud India
  'pdt_0Nq1H1dHTZzfrQ1tdeYCP': 'cloud_india', // Monthly (₹400)
  'pdt_0Nq1Hjj1bZUR5HQ9hgraU': 'cloud_india', // Annual (₹3,849)

  // Cloud Global
  'pdt_0Nq1IsTBvSZVraoe1aXnz': 'cloud_global', // Monthly ($15)
  'pdt_0Nq1JGEZBp3f6bfs9CnE2': 'cloud_global', // Annual ($144)
}
```

---

## Pricing Reference

| Plan | India Monthly | India Annual | Global Monthly | Global Annual |
|---|---|---|---|---|
| **BYOK** | ₹149 (`pdt_0Nq1FwtH5b6kZwUUltVpV`) | ₹1,199 (`pdt_0Nq1GZ0tpiOdOzJV3Ai1Y`) | $3.99 (`pdt_0Nq1I8tfZuKu3QR4Zd8et`) | $35 (`pdt_0Nq1IWgNwfCebIPUT5z1s`) |
| **Cloud** | ₹400 (`pdt_0Nq1H1dHTZzfrQ1tdeYCP`) | ₹3,849 (`pdt_0Nq1Hjj1bZUR5HQ9hgraU`) | $15 (`pdt_0Nq1IsTBvSZVraoe1aXnz`) | $144 (`pdt_0Nq1JGEZBp3f6bfs9CnE2`) |

---

## Going Live Status

- [x] Create all 8 products in Dodo Payments Live Mode dashboard
- [x] Set activation limit per license key (recommend: 2 devices per key)
- [x] Copy product IDs into `PRODUCT_ID_TO_PLAN` in `LiteDaemon/payment/dodopayments.ts`
- [x] Change `TEST_MODE = false` in `LiteDaemon/payment/dodopayments.ts`
- [x] Wire all live checkout links to `website/script.js`
- [x] Dodo Payments Live Mode business verification approved
- [x] v1.0.0 built, signed, and published to GitHub Releases

---

## Offline Grace Period

Users who are offline get **7 days** before the app requires a fresh validation.
This is configurable in `licenseStore.ts` → `isWithinGracePeriod()` function.
Change `SEVEN_DAYS_MS` to adjust.

---

## Activation Limit

Dodo Payments lets you set how many devices one license can activate.
Recommended: **2 activations** (desktop + laptop for the same user).
Set this in your Dodo Dashboard when creating the product.
