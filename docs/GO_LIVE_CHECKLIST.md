# LiteDaemon — Go-Live Checklist
> Complete this checklist before launching to real users.
> Check each item off as you complete it.

---

## ✅ Already Done (Phases 0–4)

- [x] Fork created: `github.com/adhithyadp/LiteDaemon`
- [x] App rebranded to LiteDaemon across all config files
- [x] License gate built (Dodo Payments)
- [x] 8 products created in Dodo Payments (Test Mode)
- [x] All product IDs wired into the app
- [x] Release workflow built (auto-builds Windows + Mac + Linux)
- [x] New icons generated for all platforms
- [x] Marketing website built (`/website/`)
- [x] Documentation written for developers

---

## 🔲 Before You Can Charge Real Users

### Dodo Payments — Switch to Live Mode
- [x] Create a Dodo Payments Live Mode account / switch to Live Mode (Approved!)
- [x] Re-create all 8 products in **Live Mode** (same prices, same settings)
- [x] Copy the 8 new Live Mode product IDs → send to developer
- [x] Developer updates `PRODUCT_ID_TO_PLAN` in `flowlite/payment/dodopayments.ts`
- [x] Developer sets `TEST_MODE = false` in `dodopayments.ts`
- [x] Submit Dodo Payments **Product Information Form** for business approval (Approved!)

### Website — Deploy to litedaemon.xyz
- [x] Deploy `/website/` folder to Cloudflare Pages
- [x] Connect `litedaemon.xyz` domain to hosting (Active!)
- [x] Test the website on mobile + desktop
- [x] Wire live Dodo checkout links
- [x] Add Terms of Service page (`/terms`)
- [x] Add Privacy Policy page (`/privacy`)
- [x] Add Refund Policy page (`/refunds`)
- [x] Add Contact & FAQ page (`/contact`)

### First Release — Build the Installers
- [ ] Install Rust on your machine: https://rustup.rs
- [ ] Merge `dev` into `main`: `git checkout main && git merge dev && git push`
- [ ] Tag the first release: `git tag v1.0.0 && git push origin v1.0.0`
- [ ] Wait ~40 minutes for GitHub Actions to build all installers
- [ ] Download and test the Windows `.exe` on your own PC
- [ ] Test the Mac `.dmg` on a Mac (if you have one)
- [ ] Verify the license gate works: launch app, enter a test license key

### Mac Code Signing (Optional for v1.0.0, required by v1.1.0)
- [ ] Buy Apple Developer account ($99/year): https://developer.apple.com
- [ ] Create a "Developer ID Application" certificate
- [ ] Add 5 GitHub secrets (APPLE_CERTIFICATE, APPLE_CERTIFICATE_PASSWORD, APPLE_ID, APPLE_PASSWORD, APPLE_TEAM_ID)
- [ ] Update `release.yml` with code signing steps (developer task)

---

## 🔲 Launch Day Tasks

- [ ] Post on X/Twitter: "Just launched LiteDaemon — lightweight AI voice typing. 50MB RAM. [link]"
- [ ] Post on Reddit: r/SideProject, r/SaaS, r/productivity, r/India (for Indian pricing)
- [ ] Submit to Product Hunt
- [ ] Submit to Hacker News (Show HN post)
- [ ] Email your network / early waitlist

---

## 🔲 After First 10 Paying Users

- [ ] Set up a support email autoresponder
- [ ] Watch Dodo Payments dashboard for license activations
- [ ] Collect feedback via email
- [ ] Fix any bugs within 48 hours and push `v1.0.1`

---

## 🔲 Cloud Plan — Phase 6 (Post-Launch, After 100 BYOK Users)

- [ ] Create a Cloudflare Worker account
- [ ] Build the OpenAI proxy worker (`/flowlite/cloud/`)
- [ ] Add Cloud plan validation in the app
- [ ] Test end-to-end: buy Cloud plan → activate → voice works without user's API key

---

## 📞 Support Contacts

| What | Where |
|---|---|
| Payment issues | Dodo Payments dashboard |
| App bugs | GitHub Issues |
| User emails | support@litedaemon.xyz |

---

## 🗓️ Suggested Launch Timeline

| Week | Task |
|---|---|
| Week 1 | Deploy website, switch to Live Mode, submit Dodo approval |
| Week 2 | Get Dodo approved, tag v1.0.0, test builds |
| Week 3 | Soft launch — share with 5-10 friends, fix bugs |
| Week 4 | Public launch — Product Hunt, Reddit, X |
