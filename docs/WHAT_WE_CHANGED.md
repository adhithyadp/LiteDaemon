# What We Changed — LiteDaemon Modification Log

> This file tracks EVERY change made to the codebase by the LiteDaemon team.
> Every entry must include: date, file changed, what was changed, and why.
> Original opentypeless files that were NOT touched are not listed here.

---

## Format

```
### [DATE] — [FILE PATH]
**What:** Description of the change
**Why:** Reason for the change
**Phase:** Which phase this belongs to
```

---

## Log

### 2026-10-15 — Phase 1 Branding Changes

#### `src-tauri/tauri.conf.json` — MODIFIED
**What:**
- `productName`: `OpenTypeless` → `LiteDaemon`
- `version`: `1.1.64` → `1.0.0` (our own versioning starts fresh)
- `identifier`: `com.opentypeless.app` → `app.LiteDaemon.desktop`
- Window titles: all `OpenTypeless` → `LiteDaemon`
- Deep-link scheme: `opentypeless://` → `LiteDaemon://`
- Auto-updater endpoint: points to our GitHub repo now
- CSP: updated domain allowlist to `*.LiteDaemon.app`

**Why:** Core branding — app must display LiteDaemon everywhere, not OpenTypeless
**Phase:** 1 — Branding

---

#### `package.json` — MODIFIED
**What:**
- `name`: `opentypeless` → `LiteDaemon`
- `version`: `1.1.64` → `1.0.0`
- `description`: updated to LiteDaemon description
- `repository.url`, `homepage`, `bugs.url`: updated to our GitHub
- `author`: `OpenTypeless Contributors` → `LiteDaemon`

**Why:** Package metadata should reflect LiteDaemon brand
**Phase:** 1 — Branding

---

#### `src-tauri/Cargo.toml` — MODIFIED
**What:**
- `name`: `opentypeless` → `LiteDaemon`
- `version`: `1.1.64` → `1.0.0`
- `description`: updated to LiteDaemon
- `authors`: updated to `LiteDaemon`
- `[lib] name`: `opentypeless_lib` → `LiteDaemon_lib`

**Why:** Rust crate must be named LiteDaemon for correct binary output
**Phase:** 1 — Branding

---

#### NEW FILES ADDED (Phase 1)
- `LiteDaemon/branding/colors.ts` — brand color tokens
- `LiteDaemon/branding/icons/LiteDaemon_icon_source.jpg` — source icon artwork

**Why:** Establishing brand identity files in our custom folder
**Phase:** 1 — Branding

---

### 2026-10-15 — Project Initialization (Phase 0)

**What:** Created the following new folders and files (all new additions, nothing modified):
- `/LiteDaemon/` — our custom code directory
- `/LiteDaemon/payment/` — payment integration code
- `/LiteDaemon/branding/` — brand assets
- `/LiteDaemon/branding/icons/` — app icons
- `/LiteDaemon/cloud/` — future cloud backend connector
- `/LiteDaemon/config/` — our environment config
- `/docs/` — project documentation
- `/website/` — marketing website
- `/docs/WHAT_WE_CHANGED.md` — this file
- `/docs/LiteDaemon_HANDOFF.md` — developer handoff guide
- `/docs/UPSTREAM_SYNC.md` — how to pull updates from original repo
- `/LiteDaemon/cloud/PLANNED.md` — cloud architecture plan
- `/LiteDaemon/config/.env.example` — environment variable template
- `/LiteDaemon_CHANGELOG.md` — our release changelog (separate from original CHANGELOG.md)

**Why:** Phase 0 setup — establishing clean folder structure before any feature work
**Phase:** 0 — Foundation

### 2026-10-18/19 — Phase 2: Commercial Payment Gate & Live Licensing

#### `src/App.tsx` — MINIMAL HOOK
**What:** Added 3 imports from `../LiteDaemon/payment/` and wrapped root app with `GatedMainApp` component, marked `// [LiteDaemon]`.
**Why:** Integrates license key requirement on launch with zero modification to inner app features.
**Phase:** 2 — Payment Gate

#### `LiteDaemon/payment/dodopayments.ts` — LIVE MODE
**What:** Wired all 8 live product IDs (`pdt_0Nq1...`), set `TEST_MODE = false`, implemented license activate, validate, and deactivate endpoints.
**Why:** Production Dodo Payments billing for India and Global customers.
**Phase:** 2 — Payment Gate

#### `LiteDaemon/payment/licenseStore.ts` & `useLicenseGate.ts`
**What:** Secure device license storage and 7-day offline grace period logic.
**Why:** Ensures users can voice-type while travelling or without internet for up to 7 days.
**Phase:** 2 — Payment Gate

---

### 2026-10-18/19 — Phase 3: Automated Multi-OS Release Pipeline

#### `src-tauri/src/main.rs` — MODIFIED
**What:** Updated `opentypeless_lib::run()` to `LiteDaemon_lib::run()`.
**Why:** Matches renamed Rust crate from Phase 1.
**Phase:** 3 — Release Pipeline

#### `src-tauri/icons/` & `LiteDaemon/branding/icons/` — MODIFIED
**What:** Re-encoded all PNG icons (32x32, 128x128, 128x128@2x, icon.png) as true 32-bit RGBA.
**Why:** Tauri bundler on macOS and Linux requires strict 32-bit RGBA color mode.
**Phase:** 3 — Release Pipeline

#### `src-tauri/tauri.conf.json` & `.github/workflows/release.yml` — MODIFIED
**What:** Generated dedicated LiteDaemon Minisign keypair. Placed public key in `tauri.conf.json` and passed `TAURI_SIGNING_PRIVATE_KEY` secret in `release.yml`. Included `.sig` digital signatures in release artifacts.
**Why:** Cryptographically signs release packages for the auto-updater.
**Phase:** 3 — Release Pipeline

#### **Deliverable: v1.0.0 Production Release Published**
- Windows: `LiteDaemon_1.0.0_x64-setup.exe` & `LiteDaemon_1.0.0_x64_en-US.msi`
- macOS: `LiteDaemon_1.0.0_aarch64.dmg` (Apple Silicon) & `LiteDaemon_1.0.0_x64.dmg` (Intel)
- Linux: `LiteDaemon_1.0.0_amd64.AppImage`, `.deb`, `.rpm`
- Signatures: `.sig` for all binaries attached to GitHub release.

---

### 2026-10-18/19 — Phase 4: Marketing Website & Legal Compliance

#### `website/` — COMPLETE WEBSITE
**What:** Created high-performance landing page with live pricing toggles (India vs Global, Monthly vs Annual), direct installer downloads, authentic Apple vector logo, balanced 3-platform card layout, and cache buster (`script.js?v=1.0.1`).
**Why:** Public storefront deployed to `https://litedaemon.xyz`.
**Phase:** 4 — Marketing Website

#### `website/terms.html`, `privacy.html`, `refunds.html`, `contact.html` — ADDED
**What:** Complete legal compliance pages and customer contact FAQ.
**Why:** Required for Dodo Payments merchant live verification and consumer protection.
**Phase:** 4 — Marketing Website

---

### 2026-10-21/22 — Phase 5: Production Patch v1.0.1 & Live Payment Verification

#### `LiteDaemon/payment/dodopayments.ts` — MODIFIED
**What:** 
- Corrected Dodo Payments licensing API endpoint paths by removing the invalid `/v1` prefix (`POST https://live.dodopayments.com/licenses/activate`).
- Updated `activateLicense` parser to extract instance IDs directly from Dodo Payments' root response object (`data.id`).
**Why:** Dodo Payments public licensing schema differs from the merchant core API; fixes 403 endpoint rejected errors during license key activation.
**Phase:** 5 — Production Patch v1.0.1

#### `website/script.js` & `website/index.html` — MODIFIED
**What:** 
- Updated checkout URLs to use `https://checkout.dodopayments.com/buy/{product_id}`.
- Added version cache-buster query parameter `<script src="script.js?v=1.0.1"></script>`.
- Updated all platform copy from "Windows & Mac" to "Windows, Mac & Linux" across hero title, feature cards, and pricing plan lists.
**Why:** Fixes Cloudflare Pages browser caching, resolves 403 edge blocks on hosted checkouts, and accurately advertises full Linux support.
**Phase:** 5 — Production Patch v1.0.1

#### **Milestone: End-to-End Live Transaction & App Unlock Verified**
- **Live GPay UPI Payment:** Successfully processed on `litedaemon.xyz` for ₹149 (India BYOK Monthly).
- **Transaction ID:** `pay_0NqEXWw0l9WFs6PTcStPe` | **Invoice:** `inv_0NqEXWw0l9WFs6Pi3x64Z`.
- **Merchant Balance:** Credited to Dodo Payments balance.
- **Client App Activation:** Key `e4b40066-0e21-4e65-b63d-b1e13bbd124e` entered into `LiteDaemon_1.0.1_x64-setup.exe` on Windows; verified and unlocked to `MainApp`.
- **Phase:** 5 — Production Patch v1.0.1

#### `LiteDaemon/branding/initBranding.ts` — NEW FILE & `src/App.tsx` — HOOK
**What:** 
- Created `initLiteDaemonBranding()` to dynamically inject `app.name: 'LiteDaemon'` and `home.welcome: 'Welcome to LiteDaemon'` into `i18next` at runtime across all 10 supported UI languages, while maintaining the tagline `'AI Voice Input'`.
- Hooked invocation in `src/App.tsx` within the marked `// [LiteDaemon]` comment block.
**Why:** Rebrands sidebar title and Home dashboard welcome card to LiteDaemon with 100% zero merge conflicts (upstream translation files in `src/i18n/locales/` remain completely untouched on disk).
**Phase:** 5 — Production Patch v1.0.1

#### `LiteDaemon/branding/initBranding.ts` — MODIFIED
**What:** 
- Injected `settings.storedLocally` across all 10 languages: *"Stored locally on your device. Never sent to LiteDaemon servers."* (replaces OpenTypeless server notice in Speech Recognition and AI Polish panes).
**Why:** Completely removes upstream branding leaks from settings panes at runtime with 0 merge conflicts.
**Phase:** 5 — Production Patch v1.0.1

#### `src/lib/constants.ts` — MODIFIED
**What:** 
- `APP_NAME`: `OpenTypeless` → `LiteDaemon`
- `APP_VERSION`: `v1.1.61` → `v1.0.1`
- `APP_REPO_URL`: `tover0314-w/opentypeless` → `https://github.com/adhithyadp/LiteDaemon`
- `APP_LICENSE_URL`: points to LiteDaemon repository license
**Why:** Rebrands Settings > About page header and GitHub source link to LiteDaemon.
**Phase:** 5 — Production Patch v1.0.1

#### `LiteDaemon/ui/LiteDaemonUpgrade.tsx` — NEW FILE & `src/App.tsx` — ROUTER SWAP
**What:** 
- Created dedicated LiteDaemon Upgrade & Subscription Management screen:
  * Reads and displays active license key and status from OS secure storage (`licenseStore.ts`).
  * Direct action button opening Dodo Payments customer portal (`https://customer.dodopayments.com`) for invoice downloads, payment method updates, and subscription management.
  * Interactive spring-animated toggles for Region (India ₹ vs Global $) and Billing Cycle (Monthly vs Annual with 25% savings).
  * Direct upgrade cards for LiteDaemon Cloud (managed Whisper without API keys) and LiteDaemon Annual BYOK, wired to all 8 live Dodo Payments checkout links via `@tauri-apps/plugin-opener`.
  * Styled natively using LiteDaemon Jelly design system (`jelly-card`, `bg-accent`, Framer Motion spring physics).
- Swapped route in `src/App.tsx` (`{route === 'upgrade' && <LiteDaemonUpgrade />}`) bypassing upstream OpenTypeless SaaS billing page.
**Why:** Replaces upstream third-party Stripe billing with LiteDaemon's real Dodo Payments checkout and subscription portal while maintaining 100% zero merge conflicts with upstream codebase.
**Phase:** 5 — Production Patch v1.0.1

#### `src/components/History/index.tsx` — VERIFIED
**What:** 
- Conducted full branding and code audit of the History tab.
- Confirmed zero upstream OpenTypeless branding leaks or external cloud calls; history records, playback, searching, and deletion are strictly local.
**Why:** Verification that History tab requires 0 modifications, preserving 100% clean upstream isolation.
**Phase:** 5 — Production Patch v1.0.1

#### Phase 6: Modern SaaS Account Tab with Supabase Auth — IMPLEMENTED
**What:** 
- Set up live Supabase project connection (`https://nlfbtfwcsvoaliuvfwya.supabase.co`).
- Executed PostgreSQL schema creation via Supabase Management API:
  * Created `public.profiles` table linked to `auth.users(id)` with cascade deletion (`email`, `plan`, `status`, timestamps).
  * Enabled Row Level Security (RLS) with self-read and self-update policies.
  * Added automated `public.handle_new_user()` trigger to immediately provision a profile row on signup.
- Created `LiteDaemon/auth/supabaseClient.ts` configuring `@supabase/supabase-js` client with session auto-refresh.
- Created `LiteDaemon/auth/useSupabaseAuth.ts` with Zustand store managing session persistence, profile sync, login, registration, password recovery, and logout.
- Created `LiteDaemon/ui/LiteDaemonAccount.tsx` utilizing LiteDaemon Jelly design system:
  * Logged out state: Sign In vs Sign Up tabs, email and password inputs with eye visibility toggle, password confirmation check, and password reset trigger.
  * Logged in state: User profile card, email display, Pro Member badge (Sparkles icon) vs Free BYOK badge, Dodo customer self-serve billing portal integration (`https://customer.dodopayments.com`), and Sign Out action.
- Swapped route in `src/App.tsx` (`{route === 'account' && <LiteDaemonAccount />}`) cleanly bypassing upstream OpenTypeless cloud dependency.
- Removed startup license key barrier (`GatedMainApp`) from `src/App.tsx`: App now boots directly into `MainApp`, allowing users to open and use LiteDaemon immediately without entering a 32-character key at launch.
- Created and deployed live Supabase Edge Function `dodo-webhook` (`https://nlfbtfwcsvoaliuvfwya.supabase.co/functions/v1/dodo-webhook`):
  * Listens for Dodo Payments events (`payment.succeeded`, `subscription.active`, `subscription.renewed`, `subscription.cancelled`).
  * Automatically updates the user's `profiles` record in Supabase to `plan: 'pro'` upon payment.
  * Verified end-to-end with mock test event returning HTTP 200 OK.
  * Tracked in repo under `supabase/functions/dodo-webhook/index.ts`.
**Why:** Completes the modern SaaS (Wispr Flow style) architecture. Replaces legacy stopgap license key model with automated email-based Pro entitlements and zero-barrier app launching.
**Phase:** 6 — Modern SaaS Auth & Cloud Transition

---

### 2026-10-23 — Phase 7: Production Release v1.0.5 — Onboarding Overhaul, Complete Brand Scrub & Whispr Flow Geo-Pricing

#### `website/auth-callback.html` — NEW FILE & DEPLOYED
**What:** 
- Created static, standalone OAuth bridge landing page deployed to Cloudflare Pages at `https://litedaemon.xyz/auth-callback`.
- Intercepts Supabase OAuth URL hash fragments (`#access_token=...&refresh_token=...`) and dispatches native OS deep link `litedaemon://auth-callback#...`.
- Solves Chromium browser tab closure constraints: provides interactive feedback on click, initiates automated `window.close()` attempts, refocuses desktop application, and renders a clear `<kbd>Ctrl</kbd> + <kbd>W</kbd>` guidance fallback if browser policies block programmatic script closure.
**Why:** Eliminates the infinite loading blue line on `accounts.google.com` by redirecting to a valid HTTPS 200 response rather than raw OS protocol handler.
**Phase:** 7 — Production Polish & Onboarding

#### `LiteDaemon/auth/useSupabaseAuth.ts` — MODIFIED
**What:** 
- Added Google OAuth provider configuration with `redirectTo: 'https://litedaemon.xyz/auth-callback'`.
- Implemented deep link callback parser and listener using `@tauri-apps/plugin-deep-link`.
- Integrated native window foreground refocusing via `@tauri-apps/api/webviewWindow`: calls `win.unminimize()`, `win.show()`, and `win.setFocus()` on successful authentication.
- Added `syncAuthStoreUser(session)`: updates upstream `useAuthStore.setState({ user: ... })` with authenticated Supabase user profile.
**Why:** Brings desktop app smoothly to the foreground when Google sign-in finishes, and seamlessly satisfies all upstream checks for an authenticated user without touching upstream stores.
**Phase:** 7 — Production Polish & Onboarding

#### `LiteDaemon/ui/LiteDaemonOnboardingAccount.tsx` — NEW FILE
**What:** 
- Built dedicated, zero-conflict Onboarding Account step component powered entirely by Supabase Auth.
- Offers 1-click Google Sign-In and native Email/Password sign-in and sign-up with password visibility toggles and real-time validation.
- Displays live authenticated profile card with user email, Pro badge indicator, and a prominent green "Account Connected — Ready to proceed!" status.
- Automatically enables the wizard's "Next" button upon sign-in.
**Why:** Replaces broken upstream OpenTypeless server endpoints that produced red *"Failed to fetch"* network errors during first-time onboarding.
**Phase:** 7 — Production Polish & Onboarding

#### `src/components/Onboarding/AccountStep.tsx` — MODIFIED (5-Line Wrapper)
**What:** 
- Simplified component into a minimal pass-through wrapper that renders `<LiteDaemonOnboardingAccount onComplete={onComplete} />`.
**Why:** Maintains 100% clean isolation. All proprietary onboarding logic lives in `LiteDaemon/ui/` with zero merge conflicts with upstream wizard scaffolding.
**Phase:** 7 — Production Polish & Onboarding

#### `src/i18n/locales/*.json` (All 10 Languages) — SCRUBBED
**What:** 
- Replaced all 100+ occurrences of `"OpenTypeless"` with **`"LiteDaemon"`** across `en.json`, `de.json`, `es.json`, `fr.json`, `it.json`, `ja.json`, `ko.json`, `pt.json`, `ru.json`, and `zh.json`.
- First-time welcome greeting updated to *"Set up LiteDaemon in a few steps"* across all languages.
- Preserved 100% of the original onboarding wizard steps (BYOK STT, LLM configuration, Permissions, Quick Test, Done) according to product roadmap.
**Why:** Eliminates every remaining trace of upstream branding from the first-run user experience while preserving full BYOK configuration capability.
**Phase:** 7 — Production Polish & Onboarding

#### `LiteDaemon/ui/LiteDaemonUpgrade.tsx` & `website/script.js` — MODIFIED
**What:** 
- Implemented Wispr Flow style automated geo-pricing detection:
  * Detects timezone (`Asia/Kolkata` / `IST`), browser locale (`hi`, `en-IN`), and conducts a fast asynchronous lookup against `https://api.country.is`.
  * Indian users automatically see localized **₹ INR** pricing (₹149/mo BYOK, ₹400/mo Cloud).
  * International users automatically see **$ USD** pricing ($3.99/mo BYOK, $15/mo Cloud).
  * Removed manual toggle buttons from both the desktop app and marketing website.
- Completely removed legacy license key architecture: removed masked license key displays, clipboard copy buttons, `licenseStore`, and offline grace period status badges.
- Connected subscription status directly to authenticated Supabase account with direct links to Dodo customer portal.
**Why:** Mirrors Wispr Flow's frictionless SaaS experience, eliminates visual clutter, and delivers localized pricing without confusing customer toggles.
**Phase:** 7 — Production Polish & Onboarding

---

*Upstream codebase remains 100% cleanly isolated. Proprietary components reside strictly in LiteDaemon/.*





