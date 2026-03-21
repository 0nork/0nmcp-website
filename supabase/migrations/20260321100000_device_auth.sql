-- Migration: device_auth
-- Description: Device Authorization Grant (RFC 8628) for CLI "Turn it 0n" flow
-- Author: supabase-db-manager
-- Date: 2026-03-21

-- UP
CREATE TABLE IF NOT EXISTS device_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_code TEXT NOT NULL UNIQUE,
  user_code TEXT NOT NULL UNIQUE,
  verification_uri TEXT NOT NULL DEFAULT 'https://www.0nmcp.com/activate',
  client_id TEXT DEFAULT '0nmcp-cli',
  scope TEXT DEFAULT 'full',
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'authorized', 'denied', 'expired')),
  access_token TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  interval_seconds INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for polling
CREATE INDEX IF NOT EXISTS idx_device_codes_device_code ON device_codes(device_code);
CREATE INDEX IF NOT EXISTS idx_device_codes_user_code ON device_codes(user_code);

-- Auto-expire old codes (cleanup)
CREATE INDEX IF NOT EXISTS idx_device_codes_expires ON device_codes(expires_at) WHERE status = 'pending';

-- RLS
ALTER TABLE device_codes ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access" ON device_codes FOR ALL USING (true) WITH CHECK (true);
