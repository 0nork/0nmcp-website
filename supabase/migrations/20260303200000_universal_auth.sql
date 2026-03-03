-- ============================================================
-- 0nMCP Universal Auth + Cross-Platform Vault Sync
-- ============================================================
-- Unifies authentication across CLI, Chrome extension, web
-- console, and future platforms. Enables E2E encrypted vault
-- sync so credentials entered on one platform are available
-- on all others — without the server ever seeing plaintext.
-- ============================================================

-- 1. Rename extension_tokens → api_tokens (unified across all platforms)
ALTER TABLE IF EXISTS extension_tokens RENAME TO api_tokens;

-- 2. Add columns for multi-platform support
ALTER TABLE api_tokens
  ADD COLUMN IF NOT EXISTS device_name TEXT,
  ADD COLUMN IF NOT EXISTS platform TEXT NOT NULL DEFAULT 'extension',
  ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refresh_token_hash TEXT;

-- 3. Device authorization codes (RFC 8628)
CREATE TABLE IF NOT EXISTS device_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code TEXT UNIQUE NOT NULL,
  user_code TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  device_name TEXT,
  platform TEXT NOT NULL DEFAULT 'cli',
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_device_codes_user_code
  ON device_codes(user_code) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_device_codes_device_code
  ON device_codes(device_code) WHERE status = 'pending';

-- 4. E2E encrypted vault sync
CREATE TABLE IF NOT EXISTS vault_sync (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_key TEXT NOT NULL,
  encrypted_data TEXT NOT NULL,
  iv TEXT NOT NULL,
  salt TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, service_key)
);

CREATE INDEX IF NOT EXISTS idx_vault_sync_user ON vault_sync(user_id);

-- 5. Auth audit log
CREATE TABLE IF NOT EXISTS auth_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  platform TEXT,
  device_name TEXT,
  ip_address INET,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_auth_events_user
  ON auth_events(user_id, created_at DESC);

-- 6. RLS policies
ALTER TABLE api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_sync ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_events ENABLE ROW LEVEL SECURITY;

-- Users can only manage their own tokens
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own tokens' AND tablename = 'api_tokens'
  ) THEN
    CREATE POLICY "Users manage own tokens" ON api_tokens
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can see their own device codes + pending codes (for approval flow)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own device codes' AND tablename = 'device_codes'
  ) THEN
    CREATE POLICY "Users manage own device codes" ON device_codes
      FOR ALL USING (auth.uid() = user_id OR status = 'pending');
  END IF;
END $$;

-- Users can only access their own vault sync data
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users manage own vault sync' AND tablename = 'vault_sync'
  ) THEN
    CREATE POLICY "Users manage own vault sync" ON vault_sync
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Users can only view their own auth events
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Users view own auth events' AND tablename = 'auth_events'
  ) THEN
    CREATE POLICY "Users view own auth events" ON auth_events
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Service role can insert auth events (from API routes)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role inserts auth events' AND tablename = 'auth_events'
  ) THEN
    CREATE POLICY "Service role inserts auth events" ON auth_events
      FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Service role needs full access to device_codes for the approval flow
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Service role manages device codes' AND tablename = 'device_codes'
  ) THEN
    CREATE POLICY "Service role manages device codes" ON device_codes
      FOR ALL USING (true);
  END IF;
END $$;
