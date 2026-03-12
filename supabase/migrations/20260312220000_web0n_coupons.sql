-- web0n coupon codes with single-use tracking
CREATE TABLE IF NOT EXISTS web0n_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percent', 'full')),
  discount_value NUMERIC NOT NULL DEFAULT 0,  -- e.g. 50 for 50%, ignored for 'full'
  max_uses INTEGER NOT NULL DEFAULT 1,
  times_used INTEGER NOT NULL DEFAULT 0,
  restrict_to_email TEXT,  -- null = anyone can use
  active BOOLEAN NOT NULL DEFAULT true,
  redeemed_by_email TEXT,  -- who actually used it
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add coupon_code tracking to web0n_projects
ALTER TABLE web0n_projects ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE web0n_projects ADD COLUMN IF NOT EXISTS discount_amount NUMERIC;

-- Index for fast code lookup
CREATE INDEX IF NOT EXISTS idx_web0n_coupons_code ON web0n_coupons(code);

-- Insert the 10 unique 50% off single-use coupon codes
INSERT INTO web0n_coupons (code, discount_type, discount_value, max_uses) VALUES
  ('WEB0N-HALF-7K3M', 'percent', 50, 1),
  ('WEB0N-HALF-9R2P', 'percent', 50, 1),
  ('WEB0N-HALF-4F8N', 'percent', 50, 1),
  ('WEB0N-HALF-6T1X', 'percent', 50, 1),
  ('WEB0N-HALF-2Q5W', 'percent', 50, 1),
  ('WEB0N-HALF-8J4V', 'percent', 50, 1),
  ('WEB0N-HALF-3D7Y', 'percent', 50, 1),
  ('WEB0N-HALF-5H9C', 'percent', 50, 1),
  ('WEB0N-HALF-1B6L', 'percent', 50, 1),
  ('WEB0N-HALF-0A3S', 'percent', 50, 1);

-- Also insert the existing owner codes into the DB for consistency
INSERT INTO web0n_coupons (code, discount_type, discount_value, max_uses, restrict_to_email) VALUES
  ('0NFREE', 'full', 100, 999, 'mike@rocketopp.com'),
  ('OWNER', 'full', 100, 999, 'mike@rocketopp.com')
ON CONFLICT (code) DO NOTHING;

-- RLS: coupons are server-side only (service role), no public access
ALTER TABLE web0n_coupons ENABLE ROW LEVEL SECURITY;
