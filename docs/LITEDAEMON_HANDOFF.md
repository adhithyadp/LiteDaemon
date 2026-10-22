# LiteDaemon — Developer Handoff Guide
> For any developer, agency, or team picking this up in the future.
> Last updated: October 22, 2026

---

## What Is LiteDaemon?

LiteDaemon is a **commercial fork** of [opentypeless](https://github.com/tover0314-w/opentypeless) — an open-source, lightweight AI voice-typing desktop app (MIT License).

**Our product:** A paid, lightweight alternative to Wispr Flow.
- Windows, Mac & Linux desktop app
- Press a hotkey → speak → AI-polished text appears anywhere you type
- Uses ~50MB RAM vs Wispr Flow's ~800MB on Windows
- Two plans: BYOK (users bring their own OpenAI key) and Cloud (we provide API)

**GitHub:** https://github.com/adhithyadp/LiteDaemon

---

## THE GOLDEN RULE

> ### Never edit files in `/src/` or `/src-tauri/`
> ### All our code lives in `/LiteDaemon/` and `/docs/` and `/website/`

This keeps our changes separate from the original codebase.
Pulling upstream updates = zero merge conflicts.

---

## Folder Structure

```
LiteDaemon/  (repo root)
├── src/              ← ORIGINAL — do not touch
├── src-tauri/        ← ORIGINAL — do not touch
├── package.json      ← ORIGINAL — do not touch
├── Cargo.toml        ← ORIGINAL — do not touch
│
├── LiteDaemon/         ← ALL OUR CUSTOM CODE
│   ├── payment/      — license key + Dodo Payments integration (migrating to Supabase)
│   ├── branding/     — runtime i18n dynamic branding, logo, icons, colors
│   ├── ui/           — custom screens (LiteDaemonUpgrade, etc.)
│   ├── cloud/        — cloud API proxy connector (Phase 6)
│   └── config/       — our env vars and build config
│
├── docs/             ← ALL OUR DOCUMENTATION
│   ├── WHAT_WE_CHANGED.md      — every change logged
│   ├── LiteDaemon_HANDOFF.md     — this file
│   ├── UPSTREAM_SYNC.md        — how to pull opentypeless updates
│   ├── PAYMENT_SYSTEM.md       — how payment gate works
│   └── BUILD_AND_RELEASE.md    — how to build + ship
│
├── website/          ← MARKETING WEBSITE
│
└── LiteDaemon_CHANGELOG.md  ← OUR release history
```

---

## UI Tabs Status & Architecture

| Tab | Status | Implementation Details |
|---|---|---|
| **Home Tab** | ✅ Rebranded | Dynamic runtime injection via `LiteDaemon/branding/initBranding.ts`. Sets `app.name = 'LiteDaemon'`, `app.tagline = 'AI Voice Input'`, and `home.welcome = 'Welcome to LiteDaemon'` across 10 languages with 0 disk merge conflicts. |
| **Settings Tab** | ✅ Rebranded | `settings.storedLocally` privacy notice overridden to *"Never sent to LiteDaemon servers"* across 10 languages. `src/lib/constants.ts` updated to `APP_NAME = 'LiteDaemon'`, `v1.0.1`, and LiteDaemon GitHub repository links. |
| **History Tab** | ✅ Verified Clean | Audited `src/components/History/index.tsx`. 100% clean of upstream branding leaks. Operates completely offline/locally without external API calls. |
| **Upgrade Tab** | ✅ Replaced | Swapped with `LiteDaemon/ui/LiteDaemonUpgrade.tsx`. Native Jelly card design, Dodo Payments customer portal integration, India (₹) vs Global ($) toggles, and direct live checkout links for all 8 products. |
| **Account Tab** | ✅ Implemented | Swapped with `LiteDaemon/ui/LiteDaemonAccount.tsx` powered by **Supabase Auth**. Native Jelly UI, Email & Password sign-in/sign-up, password reset, instant Pro Member badge, and Dodo self-serve billing portal integration. Automated Pro activation via live Supabase Edge Function `dodo-webhook`. Startup license key gate removed from `App.tsx` (opens directly into app). |

---

## Pricing

| Plan | India Monthly | India Annual | Global Monthly | Global Annual |
|---|---|---|---|---|
| BYOK | ₹149 | ₹1,199 | $3.99 | $35 |
| Cloud | ₹400 | ₹3,849 | $15 | $144 |

**Payment provider:** Dodo Payments (https://dodopayments.com)

---

## Tech Stack

| Layer | Tech |
|---|---|
| Desktop framework | Tauri 2 (Rust) |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Auth & User DB | Supabase (Auth + PostgreSQL) |
| Payment | Dodo Payments |
| Auto-update | Tauri Updater (built-in) |
| Cloud backend | Cloudflare Workers (Phase 6) |

---

## Git Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Always stable and shippable — what users download |
| `dev` | Active development — all work happens here |
| `upstream/main` | Tracks the original opentypeless repo |

### How to pull upstream updates safely:
```bash
git fetch upstream
git checkout dev
git merge upstream/main
# Because we never touched original files, there will be zero conflicts
```

---

## Key Accounts (Founder Owns All)

| Service | Purpose |
|---|---|
| GitHub — adhithyadp | Source code & Releases |
| Dodo Payments | Merchant payment processing & Customer billing portal |
| Supabase | User authentication & Cloud subscription state |
| Cloudflare | Marketing website hosting & Cloud proxy workers |
| Apple Developer | Mac code signing |

---

## Build Commands

```bash
npm install          # install dependencies
npm run tauri dev    # run in dev mode
npm run tauri build  # build production installer
```

See `/docs/BUILD_AND_RELEASE.md` for full instructions.

---

## Project Phases

| Phase | What | Status |
|---|---|---|
| 0 | Fork, clone, folder structure | ✅ Done |
| 1 | Branding (name, icon, logo) | ✅ Done |
| 2 | Payment gate (Dodo Payments Live Mode) | ✅ Done |
| 3 | Windows + Mac + Linux releases (v1.0.0) | ✅ Done |
| 4 | Marketing website (litedaemon.xyz) | ✅ Done |
| 5 | Production Patch v1.0.1, Live Verification & Tab Overhauls | ✅ Done |
| 6 | Account Tab SaaS Migration (Supabase Auth + Dodo Webhooks) | ✅ Done |
| 7 | Cloud backend & Managed Proxy (Whisper without user API keys) | ⏳ Planned |

---

## For Every New Feature
1. Branch from `dev`: `git checkout -b feature/your-feature`
2. Write code only in `/LiteDaemon/` — never in `/src/` or `/src-tauri/`
3. Update `WHAT_WE_CHANGED.md`
4. Update `LiteDaemon_CHANGELOG.md`
5. PR to `dev`, then merge `dev` → `main` for release

