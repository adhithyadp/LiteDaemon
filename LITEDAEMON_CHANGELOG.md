# LiteDaemon Release Changelog
> Our release history. All versions tracked here.
> The original OpenTypeless CHANGELOG.md is untouched upstream.

---

## [v1.0.6] — 2026-10-24 ☁️
*Major Update: Cloud Service Infrastructure — Free Tier + Pro Cloud Dictation*

### What's New:
- **Cloud Service Backend (Supabase):**
  - Created `user_plans` table — tracks whether each Pro user is on `byok` or `cloud` plan type, with RLS.
  - Created `usage_tracking` table — tracks weekly word usage per user (resets every Monday UTC), with RLS.
  - Added `upsert_usage()` SQL function — atomically increments usage count after each dictation, returns new week total.
  - Migration file: `supabase/migrations/001_cloud_service_tables.sql`.

- **Updated `dodo-webhook` Edge Function:**
  - All 8 Dodo product IDs now mapped to `byok` or `cloud` plan type.
  - On every payment event: updates `profiles` table (existing) **and** upserts `user_plans` (new).
  - Future subscribers automatically get the correct cloud experience from day one.

- **New `cloud-proxy` Supabase Edge Function:**
  - Validates Supabase JWT on every request — no unauthenticated access possible.
  - Free users: enforced 1,000 words/week limit (checked before and after STT to prevent overrun).
  - Cloud Pro users: unlimited dictation, no rate limit.
  - STT: **Deepgram Nova-3** pre-recorded REST API — same model as BYOK users, best-in-class accuracy.
  - Polish: **OpenAI GPT-4o-mini** — fast, affordable, Wispr Flow-quality output.
  - Uses the same system prompt style as the upstream LLM polish (fidelity, cleanup, list formatting, multi-language).
  - Graceful degradation: if polish fails, returns raw transcript rather than erroring.
  - Usage tracked via `upsert_usage()` after every successful request.

- **`LiteDaemon/cloud/usageStore.ts` — Client-Side Usage Store:**
  - Zustand store that fetches plan type + weekly usage from Supabase on sign-in.
  - Exposes: `planType`, `wordsUsedThisWeek`, `weeklyLimit`, `isLimitReached`, `usagePercent`, `isCloudPro`, `isByokPro`, `isFree`.
  - `recordUsage()` — optimistic local update after each dictation (from proxy response).
  - Free tier: **1,000 words/week** (resets every Monday UTC).
  - Auto-initializes after sign-in, resets on sign-out — wired into `useSupabaseAuth`.

- **`LiteDaemon/cloud/cloudDictation.ts` — Cloud Dictation Client:**
  - `runCloudDictation(req)` — accepts WAV audio `Uint8Array`, returns `{ transcript, polished, words_used, week_total }`.
  - Audio sent as raw HTTP body; metadata (language, polish style, selected text, sample rate) sent as headers.
  - JWT retrieved automatically from active Supabase session — no manual token handling.
  - Pre-flight local usage check before any network call (fast path for limit-hit users).
  - Full error handling: 60s timeout, network failure, free tier limit, auth expiry — all typed as `CloudDictationError`.
  - `getCloudDictationAvailability()` — pre-flight check returning `'cloud_pro' | 'free_available' | 'free_limit' | 'byok' | 'signed_out'`.

- **`LiteDaemon/ui/LiteDaemonUsageBar.tsx` — Usage Indicator UI:**
  - `<LiteDaemonUsageBarCompact />` — inline animated fill bar: "847 / 1,000 words used this week".
    - Blue 0–74%, amber warning at 75%+, red at 100%.
    - "Upgrade →" CTA appears at 75%+. "Resets [date]" always visible.
  - `<LiteDaemonLimitBanner />` — full glassmorphic red card shown when limit is hit, with "Upgrade to Pro" button.
  - `<LiteDaemonUsageBar />` — smart wrapper: shows compact or banner automatically. Renders nothing for Pro users.
  - Wired into `LiteDaemonAccount.tsx` — visible in the Account tab below subscription info.

### Architecture Notes:
- **Zero merge conflicts with upstream** — all new code lives in `LiteDaemon/cloud/` and `LiteDaemon/ui/`.
- Only minimal wiring touches our own files (`useSupabaseAuth.ts`, `LiteDaemonAccount.tsx`) — not upstream `src/`.
- Cloud service is **fully live** — Deepgram + OpenAI keys set and smoke tested ✅
  - Unauthenticated requests → 401 ✅
  - Invalid JWT → 401 ✅
  - Valid signed-in users → STT + Polish pipeline active ✅

### Files Changed:
| File | Change |
|---|---|
| `supabase/migrations/001_cloud_service_tables.sql` | Added — DB migration |
| `supabase/functions/dodo-webhook/index.ts` | Updated — plan_type recording |
| `supabase/functions/cloud-proxy/index.ts` | Added — cloud STT+Polish proxy |
| `LiteDaemon/cloud/usageStore.ts` | Added — client usage state |
| `LiteDaemon/cloud/cloudDictation.ts` | Added — cloud audio client |
| `LiteDaemon/cloud/PLANNED.md` | Updated — live build status |
| `LiteDaemon/ui/LiteDaemonUsageBar.tsx` | Added — usage indicator UI |
| `LiteDaemon/ui/LiteDaemonAccount.tsx` | Updated — usage bar wired in |
| `LiteDaemon/auth/useSupabaseAuth.ts` | Updated — usage store auto-init |

---

## [v1.0.5] — 2026-10-23 🚀
*Major Update: Onboarding Wizard Revamp, Complete Brand Scrub & Whispr Flow Auto-Detected Geo-Pricing*

### Features & Improvements:
- **Onboarding Wizard Revamp (`LiteDaemonOnboardingAccount.tsx`):**
  - Replaced broken OpenTypeless backend in onboarding with live **Supabase Auth** (Google OAuth + Email/Password sign-in/up).
  - Fixed red *"Failed to fetch"* error on account setup.
  - Added live signed-in confirmation card with instant **Next** button unlocking.
  - Maintained full BYOK configuration steps (STT, LLM, Permissions, Quick Test, Done).
  - Zero-conflict isolation: isolated in `LiteDaemon/ui/` with a 5-line wrapper in `src/components/Onboarding/AccountStep.tsx`.
- **Complete Branding Cleanliness (100% Scrub):**
  - Replaced all 100 occurrences of `"OpenTypeless"` with **`"LiteDaemon"`** across all 10 language translation files (`en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `ja.json`, `ko.json`, `pt.json`, `ru.json`, `zh.json`).
  - Welcome screen now correctly greets users with *"Set up LiteDaemon in a few steps"*.
- **Whispr Flow Style Auto-Detected Geo-Pricing:**
  - Automatically detects user location (Timezone + Locale + fast IP check) and dynamically displays **₹ INR** for Indian users and **$ USD** for international users.
  - Eliminated manual switcher clutter from both the desktop app (`LiteDaemonUpgrade.tsx`) and the landing page (`litedaemon.xyz`).
- **Legacy License Key Architecture Completely Removed:**
  - Removed masked license keys, copy buttons, `licenseStore`, and offline grace period badges.
  - Linked active subscription status directly to the authenticated Supabase user profile.
- **Interactive OAuth Completion Bridge:**
  - Added active feedback, cursor styling, and scale animations to `auth-callback.html`.
  - Dispatches deep link to immediately bring LiteDaemon into the foreground in Windows upon authentication.
- **Security Hardening & Key Modernization:**
  - Revoked legacy HS256 JWT key in Supabase cloud, completely neutralizing exposed legacy service role token (confirmed 401 Unauthorized rejection).
  - Migrated desktop client (`supabaseClient.ts`) to modern publishable key (`sb_publishable_...`).
  - Purged hardcoded fallback secret strings from `dodo-webhook` edge function.

---

## [v1.0.4] — 2026-10-23
*Fix: Google OAuth Browser Completion Bridge*
- **Auth Callback Bridge Page (`website/auth-callback.html`):** Deployed glassmorphic callback completion page to `https://litedaemon.xyz/auth-callback`.
- **Eliminated Frozen Google Tabs:** Google OAuth now redirects to HTTPS bridge instead of raw protocol, closing the consent screen and eliminating infinite loading animations.

---

## [v1.0.3] — 2026-10-23
*Fix: Supabase Deep Link Callback Routing*
- **Deep Link Handler:** Connected `litedaemon://` protocol scheme directly to `handleSupabaseCallback` in `useSupabaseAuth.ts`.
- **Google OAuth Scopes:** Explicitly configured email and profile scopes for seamless Supabase user provisioning.

---

## [v1.0.2] — 2026-10-23
*Major Update: Full UI Tab Rebrand, Native Supabase Auth & Wispr Flow Architecture*

### Features & Improvements:
- **Wispr Flow Model Transition:** Removed startup license key lock screen (`GatedMainApp`); users can launch and use the app immediately without barrier.
- **Native Account Tab:** Completely redesigned with LiteDaemon Jelly aesthetics and powered by Supabase Auth (Email/Password registration and login, password recovery, instant Pro Member badge, and Dodo self-serve billing portal).
- **Google Sign-In:** Configured full Google OAuth support with desktop deep linking (`litedaemon://auth/callback`).
- **Automated Pro Activation:** Live Supabase Edge Function `dodo-webhook` handles Dodo Payments events to automatically upgrade paid users without manual license entry.
- **Home Tab Rebrand:** Dynamic runtime i18n brand injection for app name and welcome message across all 10 supported UI languages.
- **Settings Tab Rebrand:** Privacy statement updated across 10 languages (*"Never sent to LiteDaemon servers"*), repository URLs and metadata updated to LiteDaemon.
- **Native Upgrade Screen:** Swapped upstream Stripe page with `LiteDaemonUpgrade.tsx` wired to all 8 live Dodo Payments checkout links with India (₹) vs Global ($) and Monthly vs Annual billing toggles.
- **Landing Page Updated:** Removed license key footer note and updated feature bullet points to "2 devices per account".

---

## Development History

### Phase 4 — Marketing Website (2026-10-15)
- Built full marketing website in `/website/`
- Electric blue + white premium design
- Pricing toggle: Monthly/Annual × India/Global (all 8 combinations)
- All Dodo Payments checkout links wired
- Download section: Windows, Mac (ARM + Intel), Linux
- Scroll-reveal animations, glassmorphism nav
- Deployed to `/website/` folder — ready for Cloudflare Pages

### Phase 3 — Build & Release Pipeline (2026-10-15)
- Created `.github/workflows/release.yml`
- Auto-builds on tag push: Windows .exe, Mac .dmg ×2, Linux .AppImage
- Regenerated all icons from LiteDaemon brand (32px–512px PNG, .ico)
- Created `docs/BUILD_AND_RELEASE.md`

### Phase 2 — Payment Gate (2026-10-15)
- Built license gate system in `/flowlite/payment/`
- licenseStore.ts — secure local license key storage
- dodopayments.ts — activate/validate/deactivate API client
- useLicenseGate.ts — startup check logic with 7-day offline grace period
- LicenseGate.tsx — premium paywall UI screen
- DeactivateButton.tsx — Settings device deactivation
- All 8 Dodo product IDs wired in (Test Mode)
- Single hook into App.tsx (3 import lines + GatedMainApp wrapper)

### Phase 1 — Branding (2026-10-15)
- App renamed to LiteDaemon
- tauri.conf.json, package.json, Cargo.toml updated
- Version reset to 1.0.0
- New brand colors in flowlite/branding/colors.ts
- App icon generated

### Phase 0 — Foundation (2026-10-15)
- Forked opentypeless → adhithyadp/LiteDaemon
- Created branch structure: main, dev, upstream
- Created /flowlite/, /docs/, /website/ folder structure
- All foundational documentation written

---

## [v1.0.1] — 2026-10-21 🛠️
*Production Patch Release — Dodo Payments License Activation Fix*

### Fixes & Improvements:
- **Licensing Endpoints:** Removed invalid `/v1` prefix from `activate`, `validate`, and `deactivate` API requests (`https://live.dodopayments.com/licenses/activate`).
- **Response Handling:** Updated `activateLicense` parser to extract instance IDs directly from Dodo Payments' root response object (`data.id`).
- **Direct Downloads:** Updated website release links to point directly to `v1.0.1` binary downloads.

---

## [v1.0.0] — 2026-10-19 🚀
*First official public production release — live multi-OS launch*

### Published Installers & Binaries:
- **Windows:** `LiteDaemon_1.0.0_x64-setup.exe` & `LiteDaemon_1.0.0_x64_en-US.msi`
- **macOS Apple Silicon (M1/M2/M3/M4):** `LiteDaemon_1.0.0_aarch64.dmg`
- **macOS Intel (x64):** `LiteDaemon_1.0.0_x64.dmg`
- **Linux:** `LiteDaemon_1.0.0_amd64.AppImage`, `.deb`, & `.rpm`
- **Auto-Updater:** Digital cryptographic signatures (`.sig`) generated with dedicated LiteDaemon keypair

### Features Included:
- **Commercial License Gate:** Dodo Payments live mode integration with 7-day offline grace period
- **Live Products Configured:** All 8 live monthly & annual plans (India & Global)
- **Official Branding:** LiteDaemon visual identity, RGBA 32-bit icons across all desktop formats
- **Isolated Architecture:** Zero merge conflicts with upstream OpenTypeless base
- **Marketing Site:** Deployed to `https://litedaemon.xyz` with legal policies (Terms, Privacy, Refunds, Contact)
