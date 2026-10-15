# LiteDaemon — Founder's Quick Reference
> Non-technical cheat sheet. Everything you need to know to run this product.
> No coding knowledge required to use this guide.

---

## Your Key Links

| What | Link |
|---|---|
| GitHub repo | https://github.com/adhithyadp/flowlite |
| Website files | `Desktop/project flow/flowlite/website/` |
| Dodo Payments | https://app.dodopayments.com |
| Support email | support@litedaemon.xyz |

---

## How to Ship a New Version

When you want to release an update (e.g., bug fix, new feature):

1. Tell your developer "make the change on the dev branch"
2. Developer tests it
3. Developer runs these 3 commands:
   ```
   git checkout main
   git merge dev
   git push origin main
   git tag v1.0.1
   git push origin v1.0.1
   ```
4. GitHub automatically builds installers for all platforms (~40 minutes)
5. Users get an automatic "Update Available" popup in the app

**You don't need to do anything technical** — just tell your developer what to fix.

---

## How Payments Work

```
User visits litedaemon.xyz
       ↓
Clicks "Get BYOK Plan" or "Get Cloud Plan"
       ↓
Dodo Payments checkout page
       ↓
User pays (UPI / card / etc.)
       ↓
Dodo emails them a license key automatically
       ↓
User opens LiteDaemon, enters the key
       ↓
App validates key with Dodo → unlocks
```

**You don't manage license keys manually.** Dodo handles everything.

---

## How to Check Your Revenue

1. Go to https://app.dodopayments.com
2. Click "Sales" or "Transactions"
3. You'll see all purchases, amounts, and license activations

---

## If a User Has a Problem

**"My license key doesn't work"**
→ Go to Dodo dashboard → find their purchase → check if key is valid
→ If it shows "Activation limit reached" — they need to deactivate an old device (tell them: Settings → Deactivate Device)

**"I can't download the app"**
→ Send them to: https://github.com/adhithyadp/flowlite/releases/latest

**"The app is crashing"**
→ Ask your developer to check GitHub Issues

---

## Your Pricing (Quick Reference)

| Plan | India | Savings vs Monthly | Global | Savings |
|---|---|---|---|---|
| BYOK Monthly | ₹149/mo | — | $3.99/mo | — |
| BYOK Annual | ₹1,199/yr | **Save 33%** | $35/yr | **Save 27%** |
| Cloud Monthly | ₹400/mo | — | $15/mo | — |
| Cloud Annual | ₹3,849/yr | **Save 20%** | $144/yr | **Save 20%** |

---

## Important Rules for Any Developer You Hire

Tell every developer these 3 rules:

1. **Never edit files in `/src/` or `/src-tauri/`**
   All custom code goes in `/flowlite/` only.

2. **Always log changes in `docs/WHAT_WE_CHANGED.md`**
   Every change must be documented with what and why.

3. **Always work on the `dev` branch, never directly on `main`**
   `main` = what users download. `dev` = work in progress.

Full developer guide: `docs/LITEDAEMON_HANDOFF.md`

---

## Things That Cost Money (Monthly)

| Service | Cost | What For |
|---|---|---|
| Dodo Payments | 3% per transaction | Payment processing |
| Domain (litedaemon.xyz) | ~₹800/year | Your website address |
| Cloudflare Pages | Free | Website hosting |
| GitHub | Free | Code + releases |
| OpenAI API (BYOK users pay this themselves) | — | |
| OpenAI API (Cloud plan — Phase 6) | ~$3.60/user/month | You pay this |

---

## Phase 6 — Cloud Plan (Do This After 100 BYOK Users)

Right now, Cloud plan users can't use the app yet (the backend isn't built).
Cloud plan should only be activated after you have revenue from BYOK.

When ready, tell your developer: "Build Phase 6 — the Cloud backend."
They'll read `flowlite/cloud/PLANNED.md` for the architecture.

---

## Files You Should Never Delete

| File | Why |
|---|---|
| `flowlite/config/.env` | Your API keys — if lost, request new keys from Dodo |
| `docs/WHAT_WE_CHANGED.md` | History of all changes — needed for upstream syncing |
| `docs/GO_LIVE_CHECKLIST.md` | Your launch checklist |
| `LITEDAEMON_CHANGELOG.md` | Release history |
