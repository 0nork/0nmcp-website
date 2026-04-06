-- Scoped access tokens for 0n API
-- Supports per-token permissions, expiry, and revocation
-- Master token still lives on profiles.access_token

CREATE TABLE IF NOT EXISTS access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL DEFAULT 'My Token',
  permissions TEXT[] NOT NULL DEFAULT '{all}',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  is_revoked BOOLEAN NOT NULL DEFAULT false
);

-- Index for fast token lookup (the hot path)
CREATE INDEX idx_access_tokens_token ON access_tokens(token) WHERE NOT is_revoked;

-- Index for listing user's tokens
CREATE INDEX idx_access_tokens_user ON access_tokens(user_id);

-- RLS
ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tokens"
  ON access_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tokens"
  ON access_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tokens"
  ON access_tokens FOR UPDATE
  USING (auth.uid() = user_id);
