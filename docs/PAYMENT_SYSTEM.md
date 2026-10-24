# LiteDaemon — Payment & Subscription System Documentation
> Technical reference for LiteDaemon's SaaS billing, Dodo Payments integration, and Supabase automated entitlements.
> Last updated: October 23, 2026 (v1.0.5)

---

## Overview

LiteDaemon operates a frictionless **modern SaaS subscription model** (Wispr Flow style):
1. **Zero Startup Paywall:** Users can launch and use LiteDaemon immediately without license barriers.
2. **Supabase Authentication:** Users sign in via Google OAuth or native Email/Password (`LiteDaemon/auth/useSupabaseAuth.ts`).
3. **Auto-Detected Geo-Pricing:** Pricing is automatically localized to **₹ INR** for Indian users and **$ USD** for international users based on timezone, locale, and IP country detection.
4. **Dodo Payments Checkout:** Upgrades route directly to hosted Dodo Payments checkout sessions with user email auto-attached.
5. **Real-time Webhook Provisioning:** A Supabase Edge Function (`dodo-webhook`) listens for Dodo payment events and instantly updates the user's database profile to `plan: 'pro'`.
6. **Self-Service Customer Portal:** Users manage payment methods, view invoices, or cancel subscriptions directly via Dodo Customer Portal (`https://customer.dodopayments.com`).

---

## Architecture Flow

```
User in App / Website
        │
        ├─ Detected Location: India (₹) or Global ($)
        │
        ▼
Selects Upgrade Plan (Cloud Pro)
        │
        ▼
Opens Hosted Checkout (checkout.dodopayments.com/buy/{product_id}?email={user_email})
        │
        ▼
Payment Succeeded (UPI / Card / NetBanking)
        │
        ▼
Dodo Payments Webhook Event
        │
        ▼
Supabase Edge Function: dodo-webhook
(https://nlfbtfwcsvoaliuvfwya.supabase.co/functions/v1/dodo-webhook)
        │
        ├─ Validates Webhook Payload & Customer Email
        │
        ▼
Updates public.profiles & public.user_plans
SET plan = 'pro', status = 'active', updated_at = NOW() (for Cloud)
        │
        ▼
LiteDaemon Desktop App
        │
        ├─ useLiteDaemonUsage fetches plan_type = 'cloud'
        └─ Displays "Cloud Pro" Badge ✨ and unlocks Cloud dictation proxy
```

---

## Key Files & Modules

| File | Purpose |
|---|---|
| `LiteDaemon/auth/supabaseClient.ts` | Supabase JavaScript client with session auto-refresh |
| `LiteDaemon/auth/useSupabaseAuth.ts` | Zustand store for auth state, session persistence, and deep link callbacks |
| `LiteDaemon/cloud/usageStore.ts` | Zustand store for subscription plan type (`cloud` vs `free`), zero limits |
| `LiteDaemon/cloud/cloudDictation.ts` | Client for `cloud-proxy` managed Deepgram + OpenAI STT/polish |
| `LiteDaemon/ui/LiteDaemonUpgrade.tsx` | Upgrade screen: BYOK free forever badge, Cloud pricing, and Dodo checkout links |
| `LiteDaemon/ui/LiteDaemonAccount.tsx` | Account management screen: profile, Cloud Pro / Free (BYOK) badge, Dodo portal link |
| `LiteDaemon/ui/LiteDaemonOnboardingAccount.tsx` | First-run onboarding wizard account step powered by Supabase Auth |
| `supabase/functions/dodo-webhook/index.ts` | Deno edge function provisioning Cloud Pro subscriptions to Supabase |
| `supabase/functions/cloud-proxy/index.ts` | Deno edge function providing managed STT (Deepgram Nova-3) & Polish (GPT-4o-mini) |
| `website/auth-callback.html` | Deployed OAuth bridge page for clean Google Sign-In and deep linking |
| `website/script.js` | Landing page pricing cards with matching auto-detected geo-pricing |

---

## Live Product IDs (Live Mode)

All Cloud products are configured in Dodo Payments Live Mode:

```typescript
export const CLOUD_PRODUCT_IDS = {
  // Cloud India
  'pdt_0Nq1H1dHTZzfrQ1tdeYCP': { plan: 'cloud', region: 'india', cycle: 'monthly', price: '₹400/mo' },
  'pdt_0Nq1Hjj1bZUR5HQ9hgraU': { plan: 'cloud', region: 'india', cycle: 'annual', price: '₹3,849/yr' },

  // Cloud Global
  'pdt_0Nq1IsTBvSZVraoe1aXnz': { plan: 'cloud', region: 'global', cycle: 'monthly', price: '$15/mo' },
  'pdt_0Nq1JGEZBp3f6bfs9CnE2': { plan: 'cloud', region: 'global', cycle: 'annual', price: '$144/yr' },
};
```

---

## Pricing Reference Table

| Plan | India Monthly | India Annual | Global Monthly | Global Annual | Access |
|---|---|---|---|---|---|
| **BYOK** | **Free forever** | **Free forever** | **Free forever** | **Free forever** | Instant, no checkout needed |
| **Cloud Pro** | ₹400 (`pdt_0Nq1H1dHTZzfrQ1tdeYCP`) | ₹3,849 (`pdt_0Nq1Hjj1bZUR5HQ9hgraU`) | $15 (`pdt_0Nq1IsTBvSZVraoe1aXnz`) | $144 (`pdt_0Nq1JGEZBp3f6bfs9CnE2`) | Managed STT + AI Polish |

---

## Webhook Lifecycle (`dodo-webhook`)

The Supabase Edge Function listens for the following Dodo Payments webhook events:
- `payment.succeeded`: Marks profile `plan = 'pro'` (for Cloud) and upserts `user_plans` with `plan_type = 'cloud'`.
- `subscription.active` / `subscription.renewed`: Keeps plan active.
- `subscription.cancelled` / `subscription.expired`: Downgrades profile `plan = 'free'` and `status = 'cancelled'`.

Endpoint:
```
POST https://nlfbtfwcsvoaliuvfwya.supabase.co/functions/v1/dodo-webhook
```

---

## Customer Self-Service Portal

Users can view payment history, download GST/tax invoices, update payment methods, or cancel anytime:
- **URL:** `https://customer.dodopayments.com`
- Accessible directly from the **Account Tab** and **Upgrade Tab** in LiteDaemon.

