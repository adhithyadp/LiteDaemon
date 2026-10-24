-- =============================================================================
-- LiteDaemon Cloud Service — Migration 001
-- Run this once in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: user_plans
-- Tracks which plan type each Pro user is on: 'byok' or 'cloud'
-- 'byok'  → user brings their own API keys (existing behaviour)
-- 'cloud' → user uses LiteDaemon's managed API keys (new cloud service)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_plans (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type       TEXT NOT NULL DEFAULT 'byok' CHECK (plan_type IN ('byok', 'cloud')),
  dodo_product_id TEXT,                        -- which Dodo product they bought
  dodo_subscription_id TEXT,                   -- Dodo subscription ID for renewal tracking
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)                              -- one row per user
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_user_plans_user_id ON public.user_plans(user_id);

-- Enable Row Level Security
ALTER TABLE public.user_plans ENABLE ROW LEVEL SECURITY;

-- Users can only read their own plan row
CREATE POLICY "Users can read own plan"
  ON public.user_plans FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (backend) can insert/update plan rows
CREATE POLICY "Service role can manage plans"
  ON public.user_plans FOR ALL
  USING (auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- TABLE: usage_tracking
-- Tracks word usage per user per week for free tier enforcement.
-- Free tier limit: 2000 words per rolling 7-day window (resets every Monday UTC).
-- Cloud Pro users: unlimited (cloud-proxy skips limit check for them).
-- BYOK Pro users: unlimited (they use their own keys, no tracking needed).
-- Free users: capped at 2000 words/week.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start   DATE NOT NULL,                  -- Monday of the current week (UTC)
  words_used   INTEGER NOT NULL DEFAULT 0,
  requests     INTEGER NOT NULL DEFAULT 0,     -- number of dictation requests this week
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, week_start)                  -- one row per user per week
);

-- Index for fast weekly lookups
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_week
  ON public.usage_tracking(user_id, week_start);

-- Enable Row Level Security
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage (so the app can show "1847/2000 words used")
CREATE POLICY "Users can read own usage"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role (edge function) can write usage rows
CREATE POLICY "Service role can manage usage"
  ON public.usage_tracking FOR ALL
  USING (auth.role() = 'service_role');


-- -----------------------------------------------------------------------------
-- HELPER FUNCTION: get_current_week_start()
-- Returns the Monday of the current week in UTC.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_current_week_start()
RETURNS DATE
LANGUAGE SQL
STABLE
AS $$
  SELECT DATE_TRUNC('week', NOW() AT TIME ZONE 'UTC')::DATE;
$$;


-- -----------------------------------------------------------------------------
-- HELPER FUNCTION: upsert_usage(p_user_id, p_words)
-- Called by the cloud-proxy edge function after each successful dictation.
-- Atomically increments word count + request count for the current week.
-- Returns the updated totals so the proxy can respond to the app immediately.
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.upsert_usage(p_user_id UUID, p_words INTEGER)
RETURNS TABLE(words_used INTEGER, week_start DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_week_start DATE := public.get_current_week_start();
BEGIN
  INSERT INTO public.usage_tracking (user_id, week_start, words_used, requests)
    VALUES (p_user_id, v_week_start, p_words, 1)
  ON CONFLICT (user_id, week_start)
    DO UPDATE SET
      words_used = usage_tracking.words_used + p_words,
      requests   = usage_tracking.requests + 1,
      updated_at = NOW();

  RETURN QUERY
    SELECT ut.words_used, ut.week_start
    FROM public.usage_tracking ut
    WHERE ut.user_id = p_user_id AND ut.week_start = v_week_start;
END;
$$;


-- =============================================================================
-- NEXT STEP (Part 2): Update dodo-webhook edge function to also write to
-- user_plans table when a payment event comes in, so the app knows plan_type.
-- =============================================================================
