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

---

*Upstream codebase remains 100% cleanly isolated. Only the single documented wrapper in App.tsx bridges proprietary code to the core app.*

