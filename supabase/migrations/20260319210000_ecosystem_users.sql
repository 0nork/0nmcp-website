-- Cross-product user tracking for the 0n ecosystem
-- Used by: sxowebsite.com, verifiedsxo.com, 0nmcp.com
CREATE TABLE IF NOT EXISTS ecosystem_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  stripe_customer_id TEXT,
  source TEXT DEFAULT '0nmcp',
  products_purchased TEXT[] DEFAULT '{}',
  last_seen_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_ecosystem_users_email ON ecosystem_users(email);
CREATE INDEX IF NOT EXISTS idx_ecosystem_users_stripe ON ecosystem_users(stripe_customer_id);
ALTER TABLE ecosystem_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON ecosystem_users FOR ALL USING (true) WITH CHECK (true);
