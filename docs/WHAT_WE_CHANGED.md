# What We Changed — FlowLite Modification Log

> This file tracks EVERY change made to the codebase by the FlowLite team.
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
- `productName`: `OpenTypeless` → `FlowLite`
- `version`: `1.1.64` → `1.0.0` (our own versioning starts fresh)
- `identifier`: `com.opentypeless.app` → `app.flowlite.desktop`
- Window titles: all `OpenTypeless` → `FlowLite`
- Deep-link scheme: `opentypeless://` → `flowlite://`
- Auto-updater endpoint: points to our GitHub repo now
- CSP: updated domain allowlist to `*.flowlite.app`

**Why:** Core branding — app must display FlowLite everywhere, not OpenTypeless
**Phase:** 1 — Branding

---

#### `package.json` — MODIFIED
**What:**
- `name`: `opentypeless` → `flowlite`
- `version`: `1.1.64` → `1.0.0`
- `description`: updated to FlowLite description
- `repository.url`, `homepage`, `bugs.url`: updated to our GitHub
- `author`: `OpenTypeless Contributors` → `FlowLite`

**Why:** Package metadata should reflect FlowLite brand
**Phase:** 1 — Branding

---

#### `src-tauri/Cargo.toml` — MODIFIED
**What:**
- `name`: `opentypeless` → `flowlite`
- `version`: `1.1.64` → `1.0.0`
- `description`: updated to FlowLite
- `authors`: updated to `FlowLite`
- `[lib] name`: `opentypeless_lib` → `flowlite_lib`

**Why:** Rust crate must be named FlowLite for correct binary output
**Phase:** 1 — Branding

---

#### NEW FILES ADDED (Phase 1)
- `flowlite/branding/colors.ts` — brand color tokens
- `flowlite/branding/icons/flowlite_icon_source.jpg` — source icon artwork

**Why:** Establishing brand identity files in our custom folder
**Phase:** 1 — Branding

---

### 2026-10-15 — Project Initialization (Phase 0)

**What:** Created the following new folders and files (all new additions, nothing modified):
- `/flowlite/` — our custom code directory
- `/flowlite/payment/` — payment integration code
- `/flowlite/branding/` — brand assets
- `/flowlite/branding/icons/` — app icons
- `/flowlite/cloud/` — future cloud backend connector
- `/flowlite/config/` — our environment config
- `/docs/` — project documentation
- `/website/` — marketing website
- `/docs/WHAT_WE_CHANGED.md` — this file
- `/docs/FLOWLITE_HANDOFF.md` — developer handoff guide
- `/docs/UPSTREAM_SYNC.md` — how to pull updates from original repo
- `/flowlite/cloud/PLANNED.md` — cloud architecture plan
- `/flowlite/config/.env.example` — environment variable template
- `/FLOWLITE_CHANGELOG.md` — our release changelog (separate from original CHANGELOG.md)

**Why:** Phase 0 setup — establishing clean folder structure before any feature work
**Phase:** 0 — Foundation

---

*No original files have been modified. All additions are new files in new folders.*
