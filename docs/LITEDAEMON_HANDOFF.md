# LiteDaemon — Developer Handoff Guide
> **Audience:** Any developer, engineer, agency, or founder maintaining or extending LiteDaemon.  
> **Last updated:** October 24, 2026 (v1.0.6)  
> **Current Status:** Production Live ✅

---

## 1. What Is LiteDaemon?

LiteDaemon is a **commercial fork** of [opentypeless](https://github.com/tover0314-w/opentypeless) — an open-source, ultra-lightweight AI voice-typing desktop application licensed under MIT.

### The Product
A fast, lightweight, and modern alternative to Wispr Flow:
- **Multi-platform:** Windows, macOS, and Linux desktop app powered by Tauri 2 and React.
- **Global Hotkey:** Press hotkey anywhere → speak naturally → AI-polished text inserts into any input field.
- **Lightweight Footprint:** Consumes ~50MB RAM compared to Wispr Flow's ~800MB on Windows.
- **Hybrid SaaS Model:**
  - **BYOK (Bring Your Own Key):** 100% Free Forever. Users provide their own API keys (Groq, OpenAI, Gemini, Claude, Ollama) and dictate without paying LiteDaemon anything.
  - **LiteDaemon Cloud Pro:** Paid managed subscription. Zero setup or API keys required. We provide managed STT (**Deepgram Nova-3**) and AI Polish (**OpenAI GPT-4o-mini**) via a secure Supabase Edge Function (`cloud-proxy`).

**Repository:** `https://github.com/adhithyadp/LiteDaemon`  
**Website:** `https://litedaemon.xyz`

---

## 2. THE GOLDEN RULE OF THE CODEBASE

> ### ⚠️ NEVER EDIT CORE FILES IN `/src/` OR `/src-tauri/`
> ### All custom business logic, UI, auth, payments, and cloud code MUST live in `/LiteDaemon/` and `/supabase/`

### Why This Matters
By strictly isolating our code inside `LiteDaemon/` and keeping upstream `src/` wrappers minimal:
1. **Zero Merge Conflicts:** Pulling updates from upstream `opentypeless` is seamless (`git merge upstream/main`).
2. **Clean Separation of Concerns:** Core dictation audio capture and system hooks remain upstream; billing, accounts, and cloud proxy remain proprietary.
3. **Auditability:** Any developer can immediately see what belongs to upstream vs what is LiteDaemon proprietary code.

---

## 3. Repository Architecture & Directory Map

```
LiteDaemon/  (Repository Root)
├── src/                          ← UPSTREAM OpenTypeless (Untouched except minimal pass-through wrappers)
│   ├── components/Onboarding/    ← AccountStep.tsx wraps <LiteDaemonOnboardingAccount />
│   └── App.tsx                   ← Routes 'account' and 'upgrade' to LiteDaemon components
├── src-tauri/                    ← Rust desktop backend (Configured for LiteDaemon branding & deep-links)
│
├── LiteDaemon/                   ← PROPRIETARY LITEDAEMON EXTENSION LAYER (Isolated)
│   ├── auth/                     ← Supabase client, session persistence, OAuth deep link handling
│   │   ├── supabaseClient.ts     ← Asymmetric ES256 Supabase publishable client
│   │   └── useSupabaseAuth.ts    ← Zustand auth store (Google OAuth, email/password, session refresh)
│   │
│   ├── cloud/                    ← Managed Cloud Proxy Client & Entitlement Stores
│   │   ├── cloudDictation.ts     ← Audio dispatch to cloud-proxy (WAV streaming, JWT auth)
│   │   ├── usageStore.ts         ← Zustand entitlement store (isCloudPro vs isFree)
│   │   └── PLANNED.md            ← Architecture reference for cloud proxy backend
│   │
│   ├── payment/                  ← Dodo Payments configurations & legacy stores
│   │   ├── dodopayments.ts       ← Live mode product ID mapping & customer portal routes
│   │   └── LicenseGate.tsx       ← Standalone paywall UI component
│   │
│   ├── branding/                 ← Runtime i18n dynamic branding, logos, icons, colors
│   │   ├── initBranding.ts       ← Runtime translation override injecting "LiteDaemon"
│   │   └── colors.ts             ← Jelly theme design tokens
│   │
│   ├── ui/                       ← Proprietary React Jelly UI Screens
│   │   ├── LiteDaemonUpgrade.tsx ← Pricing screen (Auto geo-pricing, BYOK Free badge, Cloud upgrade)
│   │   ├── LiteDaemonAccount.tsx ← Account hub (Cloud Pro / Free BYOK badges, billing portal)
│   │   ├── LiteDaemonOnboardingAccount.tsx ← First-run auth step in setup wizard
│   │   └── LiteDaemonUsageBar.tsx ← Legacy usage bar no-op exports (safe pass-throughs)
│   │
│   └── config/                   ← Environment variables & template (.env, .env.example)
│
├── supabase/                     ← SERVERLESS CLOUD BACKEND (Live on Supabase)
│   ├── functions/
│   │   ├── cloud-proxy/index.ts  ← Managed STT (Deepgram Nova-3) & Polish (OpenAI GPT-4o-mini)
│   │   └── dodo-webhook/index.ts ← Dodo Payments webhook handler & Supabase entitlement sync
│   └── migrations/
│       └── 001_cloud_service_tables.sql ← PostgreSQL schemas for user_plans & usage_tracking
│
├── docs/                         ← SYSTEM & ARCHITECTURE DOCUMENTATION
│   ├── LITEDAEMON_HANDOFF.md     ← This comprehensive handoff document
│   ├── WHAT_WE_CHANGED.md        ← Chronological ledger of all architectural changes
│   ├── PAYMENT_SYSTEM.md         ← Dodo Payments, product IDs, and webhook lifecycle
│   └── BUILD_AND_RELEASE.md      ← CI/CD pipeline, signing, and release guidelines
│
├── website/                      ← MARKETING SITE & OAUTH REDIRECT BRIDGE
│   └── auth-callback.html        ← OAuth bridge: receives Google redirect, dispatches litedaemon:// deep link
│
└── LITEDAEMON_CHANGELOG.md       ← User-facing versioned changelog
```

---

## 4. Business & Pricing Model (Wispr Flow Alignment)

| Plan | Price (India) | Price (Global) | Annual Discount | Access & Experience |
|---|---|---|---|---|
| **LiteDaemon BYOK** | **Free Forever** | **Free Forever** | — | • Instant access, no checkout or credit card needed.<br>• User configures their own API key (Groq, OpenAI, Gemini, Claude, Ollama).<br>• Dictation is unlimited and processed locally/via user's key. |
| **LiteDaemon Cloud Pro** | **₹400 / month** | **$15 / month** | ~20% off:<br>₹3,849/yr or $144/yr | • Zero setup — works out-of-the-box.<br>• Managed high-speed STT via **Deepgram Nova-3**.<br>• Managed AI Polish via **OpenAI GPT-4o-mini**.<br>• Unlimited dictation for subscribers.<br>• Billing managed via Dodo Customer Portal. |

### Dodo Payments Live Product IDs
```typescript
export const CLOUD_PRODUCT_IDS = {
  // Cloud India
  'pdt_0Nq1H1dHTZzfrQ1tdeYCP': { region: 'india', cycle: 'monthly', price: '₹400/mo' },
  'pdt_0Nq1Hjj1bZUR5HQ9hgraU': { region: 'india', cycle: 'annual', price: '₹3,849/yr' },

  // Cloud Global
  'pdt_0Nq1IsTBvSZVraoe1aXnz': { region: 'global', cycle: 'monthly', price: '$15/mo' },
  'pdt_0Nq1JGEZBp3f6bfs9CnE2': { region: 'global', cycle: 'annual', price: '$144/yr' },
}
```

---

## 5. Cloud Proxy & AI Pipeline

### Architecture
When a Cloud Pro subscriber dictates:
```
Desktop App (LiteDaemon)
    │
    ├─ 1. Records audio (16kHz WAV mono)
    ├─ 2. Retrieves Supabase JWT from active session
    │
    ▼
Supabase Edge Function: `cloud-proxy` (https://nlfbtfwcsvoaliuvfwya.supabase.co/functions/v1/cloud-proxy)
    │
    ├─ Validates JWT with Supabase Auth
    ├─ Checks profiles.plan === 'pro' AND user_plans.plan_type === 'cloud'
    │  └─ If not active Cloud Pro → returns HTTP 403 `subscription_required`
    │
    ├─ STT Pipeline: Deepgram Nova-3 API (using server secret DEEPGRAM_API_KEY)
    │  └─ Returns high-accuracy raw transcript
    │
    ├─ Polish Pipeline: OpenAI GPT-4o-mini (using server secret OPENAI_API_KEY)
    │  └─ System prompt: cleans filler words, formats lists, punctuation, preserves language
    │  └─ Fallback: If polish fails, gracefully returns raw transcript (never fails audio capture)
    │
    ▼
Desktop App receives { transcript, polished } → Inserts into active window cursor
```

### Server Secrets Vault (Supabase)
The edge function accesses secrets configured in the Supabase Cloud Vault:
* `DEEPGRAM_API_KEY` — Deepgram API key for Nova-3 STT.
* `OPENAI_API_KEY` — OpenAI API key for GPT-4o-mini Polish.
* `SUPABASE_SERVICE_ROLE_KEY` — Automatically injected by Supabase runtime for database bypass.

---

## 6. Authentication, Payments & Entitlements

### Supabase Auth & Google 1-Click
- Configured in `LiteDaemon/auth/useSupabaseAuth.ts` using `@supabase/supabase-js`.
- Supports email/password registration and Google OAuth.
- **Deep Link Callback:**
  - Browser completes Google OAuth → lands on `https://litedaemon.xyz/auth-callback.html`.
  - The bridge page parses the hash/tokens and redirects to `litedaemon://auth-callback#access_token=...`.
  - Handled in `src/lib/deep-link.ts` which forwards to `handleSupabaseCallback()` and brings the app to focus.

### Webhook Flow (`supabase/functions/dodo-webhook/index.ts`)
```
Dodo Payments Event (payment.succeeded, subscription.active)
    │
    ▼
dodo-webhook Edge Function
    │
    ├─ Extracts customer email and productId
    ├─ If productId is in CLOUD_PRODUCT_IDS:
    │  ├─ Updates public.profiles: SET plan = 'pro', status = 'active'
    │  └─ Upserts public.user_plans: SET plan_type = 'cloud'
    │
    └─ If productId is a BYOK product (legacy):
       ├─ Updates public.profiles: SET plan = 'free'
       └─ Upserts public.user_plans: SET plan_type = 'byok'
```

### Client Entitlement Resolution (`LiteDaemon/cloud/usageStore.ts`)
- On sign-in, `useLiteDaemonUsage.initialize(userId)` fetches both `profiles` and `user_plans`.
- Entitlement rule:
  ```typescript
  const isCloudPro = profile.plan === 'pro' && user_plans.plan_type === 'cloud'
  const isFree = !isCloudPro
  ```
- Result: **Only genuine Cloud Pro subscribers see Pro badges.** BYOK users see `Free (BYOK)` with zero limits.

---

## 7. Developer Cheatsheet & Common Workflows

### Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Run TypeScript compiler check (verify 0 errors)
npx tsc --noEmit

# 3. Launch the desktop application in dev mode
npm run tauri dev
```

### Deploying Supabase Edge Functions
```bash
# Set your Supabase Management Access Token
$env:SUPABASE_ACCESS_TOKEN = "<YOUR_SUPABASE_ACCESS_TOKEN>"

# Deploy cloud proxy
npx supabase@2.122.0 functions deploy cloud-proxy --project-ref nlfbtfwcsvoaliuvfwya

# Deploy dodo webhook
npx supabase@2.122.0 functions deploy dodo-webhook --project-ref nlfbtfwcsvoaliuvfwya
```

### Creating a New Release
LiteDaemon uses automated GitHub Actions CI (`.github/workflows/release.yml`):
```bash
# 1. Ensure working directory is clean and tsc passes
npx tsc --noEmit

# 2. Commit all changes to dev branch
git add -A
git commit -m "feat(module): description of feature"
git push origin dev

# 3. Move the git release tag (e.g. v1.0.6)
git tag -f v1.0.6
git push origin v1.0.6 --force
```
GitHub Actions will automatically build:
- Windows installer (`.msi`, `.nsis.zip`, `x64-setup.exe`)
- Mac binaries (`.dmg`, `.app.tar.gz`)
- Linux packages (`.deb`, `.AppImage`)
- Publish the release assets directly to GitHub Releases.

---

## 8. Git Branching Strategy

| Branch | Purpose | Rule |
|---|---|---|
| `main` | Production releases | Only merged from `dev` after QA. |
| `dev` | Active development | All ongoing work happens here. |
| `upstream/main` | Tracking original `opentypeless` | Never commit directly. Used for syncing. |

### How to Sync with Upstream
```bash
git fetch upstream
git checkout dev
git merge upstream/main
# Because all our custom code is isolated in /LiteDaemon/, merges succeed without conflicts.
```

---

## 9. Key Infrastructure Accounts & Access

| Service | Purpose | Owner / Dashboard |
|---|---|---|
| **GitHub** | Source repository, CI Actions, and binary releases | `adhithyadp/LiteDaemon` |
| **Supabase** | PostgreSQL database, Auth, Storage, and Edge Functions | Project Ref: `nlfbtfwcsvoaliuvfwya` (Singapore) |
| **Dodo Payments** | Merchant payments, checkout hosting, and customer portal | Live Mode (`live.dodopayments.com`) |
| **Deepgram** | Nova-3 Managed STT model provider | Edge proxy secret `DEEPGRAM_API_KEY` |
| **OpenAI** | GPT-4o-mini Managed AI Polish model provider | Edge proxy secret `OPENAI_API_KEY` |
| **Cloudflare** | Domain DNS (`litedaemon.xyz`) & Pages OAuth bridge | Cloudflare Pages hosting `website/` |

---

## 10. Rules for Future Contributors

1. **Keep Upstream Clean:** Do not put custom code into `src/` or `src-tauri/`. Always create new files inside `LiteDaemon/` and import them cleanly.
2. **Never Commit Secrets:** `.env` files are in `.gitignore`. Production secrets must stay in Supabase Vault or GitHub Secrets.
3. **Always Run Typechecks:** Run `npx tsc --noEmit` before any commit to ensure clean builds.
4. **Maintain Documentation:** When adding a feature, update `LITEDAEMON_CHANGELOG.md` and `docs/WHAT_WE_CHANGED.md`.
