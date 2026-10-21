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

## Release Status (v1.0.1 Live & Verified)

- [x] Switch Dodo Payments to Live Mode (all 8 products created, `TEST_MODE = false` configured)
- [x] Dodo Payments business verification approved
- [x] Website is live with legal compliance pages (`https://litedaemon.xyz`)
- [x] Set GitHub Actions release signing secret (`TAURI_SIGNING_PRIVATE_KEY`)
- [x] Multi-OS automated pipeline executed: Windows, macOS (Intel & Apple Silicon), Linux published
- [x] End-to-end real transaction and app unlock verified on Windows (`v1.0.1_x64-setup.exe`)
- [ ] Mac code signing via Apple Developer ID (optional for v1.0.1, recommended by v1.1.0)
- [ ] Planned UI patch (v1.0.2): Rebrand sidebar logo to LiteDaemon and decouple upstream SaaS Upgrade/Account tabs

---

## GitHub Secrets

Go to: **GitHub → adhithyadp/LiteDaemon → Settings → Secrets → Actions**

| Secret Name | Status | What It Is | Purpose |
|---|---|---|---|
| `TAURI_SIGNING_PRIVATE_KEY` | ✅ **Configured** | Minisign private signing key | Signs update packages (`.sig`) for built-in auto-updater |
| `APPLE_CERTIFICATE` | Optional (v1.1.0) | Mac Developer ID certificate (base64) | Apple code signing |
| `APPLE_CERTIFICATE_PASSWORD` | Optional (v1.1.0) | Certificate password | Decrypts signing certificate |
| `APPLE_ID` | Optional (v1.1.0) | Apple ID email | App notarization |
| `APPLE_PASSWORD` | Optional (v1.1.0) | App-specific password | Authenticates notarytool |
| `APPLE_TEAM_ID` | Optional (v1.1.0) | Apple Team ID | Identifies developer organization |

> **Note for v1.0.0 Mac users:** Without Apple Developer notarization, macOS displays an initial unverified developer notice. Users can open it by right-clicking `LiteDaemon.app` → **Open**, or by clicking "Open Anyway" in System Settings > Privacy & Security. Full Apple Developer ID notarization will be attached in v1.1.0.

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
`https://github.com/adhithyadp/LiteDaemon/releases/latest/download/latest.json`
