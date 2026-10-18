# LiteDaemon Release Changelog
> Our release history. All versions tracked here.
> The original OpenTypeless CHANGELOG.md is untouched upstream.

---

## [Unreleased] — In Development

### Phase 5 — Documentation (2026-10-15)
- Wrote new README.md (LiteDaemon branded, replaces OpenTypeless README)
- Created docs/GO_LIVE_CHECKLIST.md — complete launch checklist
- Updated LITEDAEMON_CHANGELOG.md (this file) with all phases

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
