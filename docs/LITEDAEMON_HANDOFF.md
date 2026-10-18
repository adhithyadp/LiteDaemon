# LiteDaemon — Developer Handoff Guide
> For any developer, agency, or team picking this up in the future.
> Last updated: October 2026

---

## What Is LiteDaemon?

LiteDaemon is a **commercial fork** of [opentypeless](https://github.com/tover0314-w/opentypeless) — an open-source, lightweight AI voice-typing desktop app (MIT License).

**Our product:** A paid, lightweight alternative to Wispr Flow.
- Windows + Mac desktop app
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
│   ├── payment/      — license key + Dodo Payments integration
│   ├── branding/     — logo, icons, colors
│   ├── cloud/        — cloud API proxy connector (Phase 6)
│   └── config/       — our env vars and build config
│
├── docs/             ← ALL OUR DOCUMENTATION
│   ├── WHAT_WE_CHANGED.md      — every change logged
│   ├── LiteDaemon_HANDOFF.md     — this file
│   ├── UPSTREAM_SYNC.md        — how to pull opentypeless updates
│   ├── PAYMENT_SYSTEM.md       — how payment gate works (added Phase 2)
│   └── BUILD_AND_RELEASE.md    — how to build + ship (added Phase 3)
│
├── website/          ← MARKETING WEBSITE (added Phase 4)
│
└── LiteDaemon_CHANGELOG.md  ← OUR release history
```

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
| GitHub — adhithyadp | Source code |
| Dodo Payments | Payment processing |
| Cloudflare | Cloud backend (Phase 6) |
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
| 5 | Documentation & isolation architecture | ✅ Done |
| 6 | Cloud backend | ⏳ Post-launch |

---

## For Every New Feature
1. Branch from `dev`: `git checkout -b feature/your-feature`
2. Write code only in `/LiteDaemon/` — never in `/src/` or `/src-tauri/`
3. Update `WHAT_WE_CHANGED.md`
4. Update `LiteDaemon_CHANGELOG.md`
5. PR to `dev`, then merge `dev` → `main` for release
