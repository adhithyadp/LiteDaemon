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

---

*No original files have been modified. All additions are new files in new folders.*
