# Cloud Backend — Architecture Plan
> Status: PLANNED — will be built in Phase 6 (post-launch)

## What This Is
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
