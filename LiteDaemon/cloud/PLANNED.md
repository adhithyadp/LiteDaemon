# Cloud Backend — Architecture Plan
> Status: IN PROGRESS — Phase 6 active build

## ✅ Part 1 — Database Tables (DONE)
- `user_plans` table: tracks `byok` vs `cloud` plan type per user, RLS locked
- `usage_tracking` table: tracks words_used per user per week (resets Monday UTC), RLS locked
- `get_current_week_start()` SQL function: returns current week's Monday
- `upsert_usage(user_id, words)` SQL function: atomically increments usage, returns new total
- Migration file: `supabase/migrations/001_cloud_service_tables.sql`

## ✅ Part 2 — Webhook Updated (DONE)
- `supabase/functions/dodo-webhook/index.ts` updated
- All 8 Dodo product IDs mapped to `byok` or `cloud` plan type
- On payment event: updates `profiles` (existing) AND upserts `user_plans` (new)
- Deployed live to Supabase

## ✅ Part 3 — Cloud Proxy Edge Function (FULLY LIVE ✅)
- `supabase/functions/cloud-proxy/index.ts` created and deployed
- Validates Supabase JWT on every request
- Checks plan type: free (1000 words/week limit) vs Cloud Pro (unlimited)
- STT: Deepgram Nova-3 pre-recorded REST endpoint (same model as BYOK users)
- Polish: OpenAI GPT-4o-mini with same prompt style as upstream
- Tracks usage via `upsert_usage()` SQL function after each request
- Graceful degradation: if polish fails, returns raw transcript instead of error
- **`DEEPGRAM_API_KEY` ✅ set**
- **`OPENAI_API_KEY` ✅ set**
- Smoke tested: unauthenticated → 401, invalid JWT → 401 ✅

## ✅ Part 4 — Usage Store (DONE)
- `LiteDaemon/cloud/usageStore.ts` — Zustand store, zero upstream changes
- Fetches plan type (`free` / `byok` / `cloud`) + words used this week from Supabase on sign-in
- Exposes: `wordsUsedThisWeek`, `weeklyLimit`, `isLimitReached`, `usagePercent`, `isCloudPro`, `isByokPro`, `isFree`
- `recordUsage(words, newWeekTotal)` — called by cloudDictation after each request for optimistic update
- `reset()` — called on sign-out
- Wired into `LiteDaemon/auth/useSupabaseAuth.ts`: auto-initializes after sign-in, resets on sign-out

## ✅ Part 5 — Cloud Dictation Client (DONE)
- `LiteDaemon/cloud/cloudDictation.ts` — zero upstream changes
- `runCloudDictation(req)` — accepts `Uint8Array` WAV audio, returns `{ transcript, polished, words_used, week_total }`
- Sends audio as raw HTTP body with metadata in headers (language, polish style, selected text, sample rate)
- Gets Supabase JWT from session automatically — no manual token passing
- Pre-checks usage limit locally (fast, before any network call)
- Full error handling: timeout (60s), network failure, free tier limit, auth expiry
- Calls `useLiteDaemonUsage.recordUsage()` on success to update UI in real-time
- `getCloudDictationAvailability()` — utility to check if cloud is available before showing UI

## ✅ Part 6 — Usage Bar UI (DONE)
- `LiteDaemon/ui/LiteDaemonUsageBar.tsx` — zero upstream changes
- **`<LiteDaemonUsageBarCompact />`** — inline bar showing "1,847 / 2,000 words used" with animated fill
  - Blue fill 0–74%, amber warning at 75%+, red danger at 100%
  - "Upgrade →" CTA appears at 75%+
  - "Resets [date]" shown top-right
- **`<LiteDaemonLimitBanner />`** — full card shown when limit is hit
  - Red glassmorphic card with "Upgrade to Pro" button
- **`<LiteDaemonUsageBar />`** — smart wrapper: shows compact or banner based on state
- Renders `null` for Cloud Pro and BYOK users — invisible to paying users
- Wired into `LiteDaemon/ui/LiteDaemonAccount.tsx` between subscription info and action buttons


When a user subscribes to the Cloud plan, they don't need their own OpenAI API key.
Instead, their audio is sent to our Cloudflare Worker, which forwards it to OpenAI using our key.

## Architecture
```
User's App → Cloudflare Worker (our proxy) → OpenAI Whisper API
```

## Components to Build
- Cloudflare Worker: receives audio, validates license, forwards to OpenAI
- License validation: verify the user's license key is Cloud tier before serving
- Usage tracking: count minutes per user per month
- Fair use cap: limit heavy users to prevent cost overruns

## Cost Reference
- OpenAI Whisper API: $0.006 per minute of audio
- Typical user: ~20 min/day = $3.60/month in API costs
- Cloud plan revenue: ₹400/month (~$4.80) India, $15/month Global
- Margin: Healthy for Global. India margins are thin — watch usage.

## Security
- Our OpenAI API key is stored as a Cloudflare secret — never exposed to users
- Each request is validated against Dodo Payments license before serving

## When to Build
After 100+ BYOK paying users. Don't build this before you have revenue.
