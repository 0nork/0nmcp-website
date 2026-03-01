-- Social Connections — per-user OAuth tokens for social platforms
-- Each user connects their own accounts via OAuth or API key
-- Tokens stored encrypted, used for posting on their behalf

CREATE TABLE IF NOT EXISTS social_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,              -- linkedin, reddit, dev_to, x_twitter, facebook, instagram
  access_token TEXT,                   -- OAuth access token (encrypted at rest via Supabase)
  refresh_token TEXT,                  -- OAuth refresh token
  token_expires_at TIMESTAMPTZ,        -- When access token expires
  platform_user_id TEXT,               -- Platform-specific user ID
  platform_username TEXT,              -- Display name on platform
  platform_avatar_url TEXT,            -- Profile picture URL
  platform_metadata JSONB DEFAULT '{}', -- Extra platform-specific data (subreddits, page IDs, etc.)
  is_connected BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_social_connections_user ON social_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_social_connections_platform ON social_connections(user_id, platform) WHERE is_connected = true;

ALTER TABLE social_connections ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own connections
CREATE POLICY "Users manage own social connections"
  ON social_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Service role full access (for API routes)
CREATE POLICY "Service role full access on social_connections"
  ON social_connections FOR ALL
  USING (true)
  WITH CHECK (true);

-- Auto-update timestamp
CREATE OR REPLACE FUNCTION update_social_connection_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_social_connection_updated
  BEFORE UPDATE ON social_connections
  FOR EACH ROW
  EXECUTE FUNCTION update_social_connection_timestamp();
