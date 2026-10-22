# LiteDaemon Release Changelog
> Our release history. All versions tracked here.
> The original OpenTypeless CHANGELOG.md is untouched upstream.

---

## [v1.0.2] — 2026-10-23 🚀
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
