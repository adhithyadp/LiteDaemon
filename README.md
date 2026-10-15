<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" width="100" height="100" alt="LiteDaemon Logo" />
</p>

<h1 align="center">LiteDaemon</h1>

<p align="center">
  <strong>Lightweight AI voice typing for Windows, Mac & Linux.</strong><br/>
  Speak. It types. Uses ~50MB RAM — not 800MB like the others.
</p>

<p align="center">
  <a href="https://github.com/adhithyadp/flowlite/actions/workflows/ci.yml">
    <img src="https://github.com/adhithyadp/flowlite/actions/workflows/ci.yml/badge.svg" alt="CI" />
  </a>
  <a href="https://github.com/adhithyadp/flowlite/releases">
    <img src="https://img.shields.io/github/v/release/adhithyadp/flowlite?color=3D5AFE&label=release" alt="Release" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License" />
  </a>
  <a href="https://litedaemon.xyz">
    <img src="https://img.shields.io/badge/website-litedaemon.xyz-3D5AFE" alt="Website" />
  </a>
</p>

<p align="center">
  <a href="https://litedaemon.xyz"><strong>Website</strong></a> ·
  <a href="https://github.com/adhithyadp/flowlite/releases"><strong>Download</strong></a> ·
  <a href="#quick-start"><strong>Quick Start</strong></a> ·
  <a href="docs/BUILD_AND_RELEASE.md"><strong>Build Guide</strong></a>
</p>

---

## What is LiteDaemon?

LiteDaemon is a **paid commercial fork** of [OpenTypeless](https://github.com/tover0314-w/opentypeless) — an MIT-licensed, open-source AI voice typing desktop app.

**Our value proposition:**
- Same powerful voice typing as Wispr Flow
- Uses **~50MB RAM** vs Wispr Flow's ~800MB on Windows
- Press a hotkey anywhere → speak → polished text appears instantly
- Native Tauri app — not an Electron wrapper
- Supports 100+ languages via OpenAI Whisper

## Plans & Pricing

| Plan | India | Global | Description |
|---|---|---|---|
| **BYOK Monthly** | ₹149/mo | $3.99/mo | Bring your own OpenAI API key |
| **BYOK Annual** | ₹1,199/yr *(Save 33%)* | $35/yr *(Save 27%)* | Same as above, billed yearly |
| **Cloud Monthly** | ₹400/mo | $15/mo | We provide the API — zero setup |
| **Cloud Annual** | ₹3,849/yr *(Save 20%)* | $144/yr *(Save 20%)* | Same as above, billed yearly |

→ **[Get a plan at litedaemon.xyz](https://litedaemon.xyz#pricing)**

---

## Download

| Platform | Download |
|---|---|
| Windows | [LiteDaemon-Setup.exe](https://github.com/adhithyadp/flowlite/releases/latest) |
| macOS (Apple Silicon) | [LiteDaemon-arm64.dmg](https://github.com/adhithyadp/flowlite/releases/latest) |
| macOS (Intel) | [LiteDaemon-x64.dmg](https://github.com/adhithyadp/flowlite/releases/latest) |
| Linux | [LiteDaemon.AppImage](https://github.com/adhithyadp/flowlite/releases/latest) |

---

## How It Works

1. **Buy** a plan at litedaemon.xyz → receive license key by email
2. **Download** the installer for your OS
3. **Install** and launch LiteDaemon
4. **Enter** your license key when prompted
5. **Press** the hotkey anywhere → speak → done

---

## Quick Start (Development)

> Requires: [Rust](https://rustup.rs), Node.js 20+

```bash
git clone https://github.com/adhithyadp/flowlite.git
cd flowlite
npm install
npm run tauri dev
```

## Building Installers

```bash
npm run tauri build
# Output: src-tauri/target/release/bundle/
```

See [docs/BUILD_AND_RELEASE.md](docs/BUILD_AND_RELEASE.md) for the full release process.

---

## Project Structure

```
flowlite/
├── src/              ← Original OpenTypeless frontend (React + TypeScript)
├── src-tauri/        ← Original OpenTypeless backend (Rust + Tauri)
│
├── flowlite/         ← LiteDaemon custom additions (never conflicts with upstream)
│   ├── payment/      — License gate, Dodo Payments integration
│   ├── branding/     — Logo, icons, color tokens
│   ├── cloud/        — Cloud backend plan (Phase 6)
│   └── config/       — Environment variables
│
├── docs/             ← Developer documentation
│   ├── LITEDAEMON_HANDOFF.md   — Onboarding guide for new developers
│   ├── WHAT_WE_CHANGED.md      — Complete modification log
│   ├── PAYMENT_SYSTEM.md       — Payment gate architecture
│   ├── BUILD_AND_RELEASE.md    — Release process
│   └── UPSTREAM_SYNC.md        — How to pull upstream updates
│
├── website/          ← Marketing website (litedaemon.xyz)
└── .github/workflows/release.yml  ← Auto-build for all platforms
```

---

## Developer Documentation

| Document | Description |
|---|---|
| [LITEDAEMON_HANDOFF.md](docs/LITEDAEMON_HANDOFF.md) | Full onboarding guide — start here |
| [WHAT_WE_CHANGED.md](docs/WHAT_WE_CHANGED.md) | Every change we made to original code, logged with reason |
| [PAYMENT_SYSTEM.md](docs/PAYMENT_SYSTEM.md) | License gate & Dodo Payments architecture |
| [BUILD_AND_RELEASE.md](docs/BUILD_AND_RELEASE.md) | How to build and ship new versions |
| [UPSTREAM_SYNC.md](docs/UPSTREAM_SYNC.md) | How to pull upstream OpenTypeless updates |
| [LITEDAEMON_CHANGELOG.md](LITEDAEMON_CHANGELOG.md) | Our release history |

---

## Contributing

This is a commercial project. If you're a developer hired to work on LiteDaemon:

1. **Read [docs/LITEDAEMON_HANDOFF.md](docs/LITEDAEMON_HANDOFF.md) first** — mandatory
2. **Never edit files in `/src/` or `/src-tauri/`** — all our code goes in `/flowlite/`
3. **Log every change in [docs/WHAT_WE_CHANGED.md](docs/WHAT_WE_CHANGED.md)**
4. **Branch from `dev`**, PR back to `dev`, never directly to `main`

---

## Acknowledgements

LiteDaemon is built on top of [OpenTypeless](https://github.com/tover0314-w/opentypeless) by tover0314-w, licensed under the [MIT License](LICENSE).

We are deeply grateful to the OpenTypeless contributors for building such a solid foundation.

---

## License

MIT — see [LICENSE](LICENSE) for details.

The original OpenTypeless codebase is MIT licensed. Our additions in `/flowlite/` and `/website/` are proprietary and owned by LiteDaemon.
