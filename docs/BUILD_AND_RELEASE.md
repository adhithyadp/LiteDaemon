# LiteDaemon — Build & Release Guide
> How to build installers and ship new versions.
> Last updated: October 2026

---

## Platforms Supported

| Platform | Installer Type | Architecture |
|---|---|---|
| Windows | `.exe` (NSIS installer) + `.msi` | x64 |
| macOS | `.dmg` | Apple Silicon (M1/M2/M3) + Intel |
| Linux | `.AppImage` + `.deb` | x64 |

The original opentypeless codebase already supports all three platforms.
We just added the release workflow on top.

---

## How Releases Work (Automatic)

When you're ready to ship a new version, you do **3 commands**. GitHub does everything else.

```bash
# Step 1: Make sure you're on main and it's clean
git checkout main
git merge dev
git push origin main

# Step 2: Tag the version (e.g., v1.0.0)
git tag v1.0.0

# Step 3: Push the tag — this triggers the auto-build
git push origin v1.0.0
```

**GitHub Actions then:**
1. Spins up Windows, Mac (ARM), Mac (Intel), and Linux build machines simultaneously
2. Builds the app on all 4 platforms (~30-45 min total)
3. Creates a GitHub Release automatically
4. Uploads all installers as downloadable files
5. Updates the auto-updater `latest.json` so existing users get update prompts

**That's it.** No manual building needed.

---

## Version Numbering

Use [semantic versioning](https://semver.org/): `vMAJOR.MINOR.PATCH`

| Version bump | When |
|---|---|
| `v1.0.1` | Bug fixes |
| `v1.1.0` | New feature |
| `v2.0.0` | Breaking change or major redesign |

**Important:** The version in `tauri.conf.json` and `package.json` should match the tag.

---

## Before First Release — Checklist

- [ ] Rust installed on your machine: https://rustup.rs
- [ ] Switch Dodo Payments to Live Mode (create live products, update IDs in `dodopayments.ts`, set `TEST_MODE = false`)
- [ ] Apple Developer account for Mac code signing (~$99/year) — without this, Mac users get a warning
- [ ] Set GitHub Actions secrets (see below)
- [ ] Website is live (Phase 4)
- [ ] Dodo Payments business approved

---

## GitHub Secrets Required

Go to: **GitHub → adhithyadp/flowlite → Settings → Secrets → Actions**

Add these secrets:

| Secret Name | What It Is | Where to Get |
|---|---|---|
| `APPLE_CERTIFICATE` | Mac code signing certificate (base64) | Apple Developer account |
| `APPLE_CERTIFICATE_PASSWORD` | Password for the certificate | You set it when creating |
| `APPLE_ID` | Your Apple ID email | Your Apple account |
| `APPLE_PASSWORD` | App-specific password | appleid.apple.com → Security |
| `APPLE_TEAM_ID` | Apple Team ID | developer.apple.com |

> **For v1.0.0 launch, you can skip Apple signing.** Mac users will see a warning the first time. To dismiss it, they right-click the app → Open. This is fine for early users. Add signing before v1.1.0.

---

## Icons

All icon files live in `src-tauri/icons/`. They were generated from the source image in `flowlite/branding/icons/`.

| File | Used For |
|---|---|
| `icon.ico` | Windows taskbar, title bar |
| `icon.icns` | Mac dock, Finder |
| `icon.png` (512px) | Linux, general use |
| `128x128.png` | Windows installer |
| `32x32.png` | Small UI elements |

**To regenerate icons** (if you change the logo):
```bash
node flowlite/branding/gen_icons.cjs   # regenerates PNGs
node flowlite/branding/gen_ico.cjs     # regenerates Windows .ico
# .icns is generated automatically by Tauri during Mac build
```

---

## Building Locally (Optional — for testing)

If you want to test a build on your own machine:

```bash
# Install Rust first: https://rustup.rs
# Then:
npm install
npm run tauri build
```

The output will be in `src-tauri/target/release/bundle/`

---

## Auto-Updates

LiteDaemon has built-in auto-update powered by Tauri Updater.
When you release a new version tag, GitHub Actions uploads `latest.json` automatically.
Users will see an "Update available" prompt in the app.

The updater endpoint (in `tauri.conf.json`) points to:
`https://github.com/adhithyadp/flowlite/releases/latest/download/latest.json`
