# LiteDaemon Cloud Backend — Architecture & Pricing Documentation
> Status: LIVE IN PRODUCTION ✅
> Model: BYOK Free Forever | Cloud Pro Paid Subscription (No trial, no word counters)

---

## 1. Business & Pricing Model

| Plan | Pricing | Target Audience | Features |
|---|---|---|---|
| **LiteDaemon BYOK** | **Free Forever** ($0 / ₹0) | Technical / cost-conscious users | • Bring your own API keys (Groq, OpenAI, Gemini, Claude, Ollama)<br>• Unlimited dictation<br>• 100% on-device private processing<br>• No payment or subscription required |
| **LiteDaemon Cloud Pro** | **₹400/mo** (India) / **$15/mo** (Global)<br>*(Annual: ~20% off — ₹3,849/yr or $144/yr)* | Users who want zero setup | • Zero setup — no API keys required<br>• Managed high-accuracy STT via **Deepgram Nova-3**<br>• Intelligent AI Polish via **OpenAI GPT-4o-mini**<br>• Priority low-latency edge proxy<br>• Direct billing via Dodo Payments |

---

## 2. Architecture Overview

```
                        ┌──────────────────────────────────────────────┐
                        │              LiteDaemon Client               │
                        └───────┬──────────────────────────────┬───────┘
                                │                              │
                [BYOK Mode: User has API Keys]         [Cloud Pro: Signed-In Subscriber]
                                │                              │
                                ▼                              ▼
                    Direct to User's Provider       Supabase Edge Function: `cloud-proxy`
                   (Groq / OpenAI / Gemini / Ollama)           │
                                                ┌──────────────┴──────────────┐
                                                ▼                             ▼
                                        Deepgram Nova-3 (STT)      OpenAI GPT-4o-mini (Polish)
```

---

## 3. Implemented Components

### ✅ Part 1 — Database & Entitlements (Supabase)
- **`user_plans` table:** Maps `user_id` → `plan_type` (`'byok'` vs `'cloud'`), secured with RLS.
- **`profiles` table:** Tracks account `plan` (`'free'` vs `'pro'`) and `status` (`'active'`).
  - Only active **Cloud** subscribers have `plan: 'pro'`.
  - BYOK users have `plan: 'free'`.
- **`usage_tracking` table & `upsert_usage()` SQL function:** Kept for internal telemetry and cost monitoring.

### ✅ Part 2 — Dodo Payments Webhook (`supabase/functions/dodo-webhook/index.ts`)
- Automatically receives Dodo payment events (`payment.succeeded`, `subscription.active`, etc.).
- Maps live product IDs to plan types:
  - **Cloud Products:** `pdt_0Nq1H1dHTZzfrQ1tdeYCP` (India M), `pdt_0Nq1Hjj1bZUR5HQ9hgraU` (India A), `pdt_0Nq1IsTBvSZVraoe1aXnz` (Global M), `pdt_0Nq1JGEZBp3f6bfs9CnE2` (Global A) → Sets `plan: 'pro'`, `plan_type: 'cloud'`.
  - **BYOK Products:** Legacy purchases or free tier users → Sets `plan: 'free'`, `plan_type: 'byok'`.
- Deployed live to Supabase.

### ✅ Part 3 — Cloud Proxy Edge Function (`supabase/functions/cloud-proxy/index.ts`)
- Validates Supabase JWT on every request.
- Checks Cloud Pro entitlement: only `plan === 'pro'` AND `plan_type === 'cloud'` users can dictate.
- Returns clean 403 `subscription_required` for non-subscribers with upgrade link.
- High-performance STT: **Deepgram Nova-3** via REST endpoint using LiteDaemon's managed key.
- Smart context polish: **OpenAI GPT-4o-mini** with clean system prompts and selected-text editing.
- Secrets securely managed in Supabase secrets vault (`DEEPGRAM_API_KEY`, `OPENAI_API_KEY`).

### ✅ Part 4 — Usage & Entitlement Store (`LiteDaemon/cloud/usageStore.ts`)
- Zustand store managing user entitlement state:
  - `isCloudPro`: true only for active Cloud subscribers.
  - `isFree`: true for all BYOK users (free forever).
  - `planType`: `'cloud'` | `'free'`.
- Word counter and weekly limit restrictions removed in accordance with the new model.

### ✅ Part 5 — Client UI (`LiteDaemon/ui/`)
- **`LiteDaemonUpgrade.tsx`:**
  - BYOK Card: Displays **"Free forever"**, with badge "✓ Your current plan — always free" and no checkout link.
  - Cloud Card: Displays auto-detected localized pricing (₹400/mo or $15/mo) with "Upgrade to Cloud" CTA.
- **`LiteDaemonAccount.tsx`:**
  - Free users: Shows **"Free (BYOK)"** badge, plan "LiteDaemon Free (BYOK)", and an "Upgrade to LiteDaemon Cloud" card.
  - Cloud subscribers: Shows **"Cloud Pro"** badge, plan "LiteDaemon Cloud Pro", and "Manage Billing & Invoices" Dodo portal button.
- **`LiteDaemonOnboardingAccount.tsx`:**
  - Updated confirmation screen showing "LiteDaemon Free (BYOK) — Free forever — bring your own API keys" or "LiteDaemon Cloud Pro — Active".

---

## 4. Codebase Isolation
- **100% Upstream Protection:** All custom business logic, authentication, proxies, and UI reside strictly inside `LiteDaemon/` and `supabase/`.
- Upstream OpenTypeless core files are preserved without regressions or merge conflicts.
