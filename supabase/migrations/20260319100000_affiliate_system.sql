CREATE TABLE IF NOT EXISTS affiliate_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referral_code TEXT UNIQUE NOT NULL,
  referred_email TEXT,
  referred_user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending', -- pending, converted, expired
  commission_cents INTEGER DEFAULT 0,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE affiliate_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own referrals" ON affiliate_referrals FOR SELECT USING (referrer_id = auth.uid());
CREATE POLICY "Service role full access" ON affiliate_referrals FOR ALL USING (true) WITH CHECK (true);

-- Add referral_code to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referred_by TEXT;
