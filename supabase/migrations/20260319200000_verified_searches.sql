-- VerifiedSXO search tracking — rate limiting + analytics
CREATE TABLE IF NOT EXISTS verified_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_ip TEXT NOT NULL,
  question TEXT,
  provider TEXT,
  user_id UUID REFERENCES auth.users(id),
  source TEXT DEFAULT 'verifiedsxo',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verified_searches_ip_date ON verified_searches(client_ip, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_verified_searches_created ON verified_searches(created_at DESC);

ALTER TABLE verified_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON verified_searches FOR ALL USING (true) WITH CHECK (true);
