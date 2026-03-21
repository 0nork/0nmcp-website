-- OAuth 2.0 Authorization Server Tables
-- Supports Authorization Code Grant (RFC 6749) with PKCE (RFC 7636)

-- ─── Registered OAuth Clients ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth_clients (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id          TEXT NOT NULL UNIQUE,
  client_secret_hash TEXT,                     -- NULL for public clients (PKCE required)
  app_name           TEXT NOT NULL,
  app_logo_url       TEXT,
  redirect_uris      TEXT[] NOT NULL DEFAULT '{}',
  allowed_scopes     TEXT[] NOT NULL DEFAULT '{openid,email,profile}',
  is_confidential    BOOLEAN NOT NULL DEFAULT true,
  is_active          BOOLEAN NOT NULL DEFAULT true,
  created_by         UUID REFERENCES auth.users(id),
  created_at         TIMESTAMPTZ DEFAULT now(),
  updated_at         TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_clients_client_id ON oauth_clients(client_id);

-- ─── Authorization Codes (short-lived, single-use) ─────────────────────────
CREATE TABLE IF NOT EXISTS oauth_authorization_codes (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_hash             TEXT NOT NULL UNIQUE,
  client_id             TEXT NOT NULL REFERENCES oauth_clients(client_id),
  user_id               UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  redirect_uri          TEXT NOT NULL,
  scope                 TEXT NOT NULL,
  state                 TEXT,
  code_challenge        TEXT,
  code_challenge_method TEXT CHECK (code_challenge_method IN ('S256', 'plain')),
  used                  BOOLEAN DEFAULT false,
  expires_at            TIMESTAMPTZ NOT NULL,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_hash ON oauth_authorization_codes(code_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_auth_codes_expires ON oauth_authorization_codes(expires_at);

-- ─── Access Tokens ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth_access_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  TEXT NOT NULL UNIQUE,
  client_id   TEXT NOT NULL REFERENCES oauth_clients(client_id),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes      TEXT[] NOT NULL DEFAULT '{}',
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_hash ON oauth_access_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_user ON oauth_access_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_oauth_access_tokens_expires ON oauth_access_tokens(expires_at);

-- ─── Refresh Tokens ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS oauth_refresh_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash  TEXT NOT NULL UNIQUE,
  client_id   TEXT NOT NULL REFERENCES oauth_clients(client_id),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scopes      TEXT[] NOT NULL DEFAULT '{}',
  revoked     BOOLEAN DEFAULT false,
  expires_at  TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_hash ON oauth_refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_oauth_refresh_tokens_user ON oauth_refresh_tokens(user_id);

-- ─── Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE oauth_clients              ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_authorization_codes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_access_tokens        ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_refresh_tokens       ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_oauth_clients" ON oauth_clients
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_oauth_codes" ON oauth_authorization_codes
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_oauth_access" ON oauth_access_tokens
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_oauth_refresh" ON oauth_refresh_tokens
  FOR ALL USING (auth.role() = 'service_role');

-- ─── Cleanup Function ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION cleanup_expired_oauth_data()
RETURNS void AS $$
BEGIN
  DELETE FROM oauth_authorization_codes WHERE expires_at < now();
  DELETE FROM oauth_access_tokens WHERE expires_at < now();
  DELETE FROM oauth_refresh_tokens WHERE expires_at < now() OR revoked = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
