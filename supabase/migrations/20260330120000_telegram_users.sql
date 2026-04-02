-- 0nGram — Telegram user mapping for the 0nMCP bot
-- Maps telegram_id → 0nmcp user_id for personalized AI + Vault context

CREATE TABLE IF NOT EXISTS telegram_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id bigint UNIQUE NOT NULL,
  telegram_username text,
  telegram_first_name text,
  onmcp_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  location_id uuid,
  is_connected boolean DEFAULT false,
  connect_token text,
  connect_token_expires timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for fast lookups by telegram_id (primary access pattern)
CREATE INDEX IF NOT EXISTS idx_telegram_users_telegram_id ON telegram_users(telegram_id);

-- Index for looking up by onmcp_user_id (reverse lookup)
CREATE INDEX IF NOT EXISTS idx_telegram_users_onmcp_user_id ON telegram_users(onmcp_user_id);

-- Index for connect token verification
CREATE INDEX IF NOT EXISTS idx_telegram_users_connect_token ON telegram_users(connect_token) WHERE connect_token IS NOT NULL;

-- RLS: service role only (webhook handler uses admin client)
ALTER TABLE telegram_users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own telegram connection
CREATE POLICY "Users can view own telegram connection"
  ON telegram_users FOR SELECT
  USING (onmcp_user_id = auth.uid());

-- Allow authenticated users to connect their telegram
CREATE POLICY "Users can connect own telegram"
  ON telegram_users FOR UPDATE
  USING (onmcp_user_id IS NULL OR onmcp_user_id = auth.uid())
  WITH CHECK (onmcp_user_id = auth.uid());

-- Service role has full access (for webhook handler)
CREATE POLICY "Service role full access"
  ON telegram_users FOR ALL
  USING (auth.role() = 'service_role');
