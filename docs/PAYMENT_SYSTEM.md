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

## Plans / Product IDs

The mapping lives in `dodopayments.ts` in the `PRODUCT_ID_TO_PLAN` object:

```typescript
const PRODUCT_ID_TO_PLAN: Record<string, PlanType> = {
  'BYOK_INDIA_PRODUCT_ID':   'byok_india',
  'BYOK_GLOBAL_PRODUCT_ID':  'byok_global',
  'CLOUD_INDIA_PRODUCT_ID':  'cloud_india',
  'CLOUD_GLOBAL_PRODUCT_ID': 'cloud_global',
}
```

**Replace the placeholder strings with your actual Dodo Payments product IDs.**
Find them in: Dodo Dashboard → Products → [Product Name] → copy the Product ID.

---

## Pricing Reference

| Plan | India | Global |
|---|---|---|
| BYOK Monthly | ₹149 | $3.99 |
| BYOK Annual | ₹1,199 | $35 |
| Cloud Monthly | ₹400 | $15 |
| Cloud Annual | ₹3,849 | $144 |

---

## Going Live Checklist

- [ ] Create all 4 products in Dodo Payments dashboard
- [ ] Set activation limit per license key (recommend: 2 devices per key)
- [ ] Copy product IDs into `PRODUCT_ID_TO_PLAN` in `dodopayments.ts`
- [ ] Change `TEST_MODE = true` → `TEST_MODE = false` in `dodopayments.ts`
- [ ] Test a full purchase → activation → deactivation flow
- [ ] Build and release

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
