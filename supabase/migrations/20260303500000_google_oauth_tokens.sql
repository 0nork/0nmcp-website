-- Google OAuth token storage
-- Stores refresh tokens for "Connect Google" mega-button
-- Separate from user_vaults because OAuth tokens need server-side refresh lifecycle

CREATE TABLE IF NOT EXISTS public.google_oauth_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- RLS: users can only read/write their own tokens
ALTER TABLE public.google_oauth_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own google tokens"
  ON public.google_oauth_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own google tokens"
  ON public.google_oauth_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own google tokens"
  ON public.google_oauth_tokens FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own google tokens"
  ON public.google_oauth_tokens FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass for API routes
CREATE POLICY "Service role full access google tokens"
  ON public.google_oauth_tokens FOR ALL
  USING (auth.role() = 'service_role');

-- Index for fast user lookup
CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_user_id ON public.google_oauth_tokens(user_id);
