-- ============================================================
-- Stripe Connect Marketplace — Vendor Profiles, Payouts, Splits
-- ============================================================
-- Enables automated payouts to vendors and integrated partners.
-- Uses Stripe Connect Express accounts for KYC/identity.
-- Platform takes application_fee_percent on each transaction.
-- ============================================================

-- ── Vendor Profiles ──
-- Tracks Stripe Connected Account status per vendor
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe Connect
  stripe_account_id TEXT,               -- acct_xxx from Stripe Connect
  stripe_onboarding_complete BOOLEAN DEFAULT false,
  charges_enabled BOOLEAN DEFAULT false,
  payouts_enabled BOOLEAN DEFAULT false,
  details_submitted BOOLEAN DEFAULT false,

  -- Vendor info
  business_name TEXT,
  business_type TEXT DEFAULT 'individual', -- individual | company | non_profit
  country TEXT DEFAULT 'US',
  default_currency TEXT DEFAULT 'usd',

  -- Platform settings
  application_fee_percent NUMERIC(5,2) DEFAULT 20.00, -- platform takes 20% by default
  vendor_tier TEXT DEFAULT 'standard',   -- standard | preferred | partner
  is_approved BOOLEAN DEFAULT false,     -- admin approval gate
  is_active BOOLEAN DEFAULT true,

  -- Stats
  total_revenue_cents BIGINT DEFAULT 0,
  total_payouts_cents BIGINT DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  lifetime_customers INTEGER DEFAULT 0,

  -- Timestamps
  applied_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT vendor_profiles_user_id_key UNIQUE (user_id)
);

-- ── Marketplace Transactions ──
-- Every marketplace purchase with payment split details
CREATE TABLE IF NOT EXISTS marketplace_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Parties
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),

  -- What was purchased
  listing_id TEXT,                        -- store_listings.id reference
  listing_name TEXT,
  listing_type TEXT DEFAULT 'workflow',   -- workflow | template | service | bundle

  -- Payment
  amount_cents INTEGER NOT NULL,          -- total charge to buyer
  platform_fee_cents INTEGER NOT NULL,    -- platform's cut
  vendor_payout_cents INTEGER NOT NULL,   -- vendor's cut
  currency TEXT DEFAULT 'usd',

  -- Stripe references
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  stripe_transfer_id TEXT,               -- transfer to connected account
  stripe_checkout_session_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending',          -- pending | completed | refunded | disputed | failed
  refund_amount_cents INTEGER DEFAULT 0,
  refund_reason TEXT,

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Marketplace Payouts ──
-- Tracks automated payouts to vendor bank accounts
CREATE TABLE IF NOT EXISTS marketplace_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendor_profiles(id),

  -- Payout details
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',

  -- Stripe references
  stripe_payout_id TEXT UNIQUE,
  stripe_account_id TEXT,

  -- Status
  status TEXT DEFAULT 'pending',          -- pending | in_transit | paid | failed | canceled
  failure_message TEXT,

  -- Period
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  arrival_date TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Payment Methods (saved cards for buyers) ──
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe
  stripe_customer_id TEXT NOT NULL,
  stripe_payment_method_id TEXT NOT NULL,

  -- Card details (non-sensitive display info)
  card_brand TEXT,                        -- visa, mastercard, amex
  card_last4 TEXT,                        -- last 4 digits
  card_exp_month INTEGER,
  card_exp_year INTEGER,

  -- Status
  is_default BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT payment_methods_stripe_pm_key UNIQUE (stripe_payment_method_id)
);

-- ── Add vendor columns to profiles ──
DO $$ BEGIN
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_vendor BOOLEAN DEFAULT false;
  ALTER TABLE profiles ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT NULL;
  -- vendor_status: null | applied | approved | rejected | suspended
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── Add vendor_id to store_listings (if table exists) ──
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'store_listings') THEN
    ALTER TABLE store_listings ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendor_profiles(id);
    ALTER TABLE store_listings ADD COLUMN IF NOT EXISTS vendor_payout_percent NUMERIC(5,2) DEFAULT 80.00;
  END IF;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_user_id ON vendor_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_stripe_account ON vendor_profiles(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_approved ON vendor_profiles(is_approved, is_active);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_buyer ON marketplace_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_vendor ON marketplace_transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_status ON marketplace_transactions(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_transactions_created ON marketplace_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_payouts_vendor ON marketplace_payouts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_payouts_status ON marketplace_payouts(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_customer ON payment_methods(stripe_customer_id);

-- ── RLS Policies ──
ALTER TABLE vendor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Vendor profiles: users can read their own, service_role manages
CREATE POLICY "Users can view own vendor profile"
  ON vendor_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages vendor profiles"
  ON vendor_profiles FOR ALL
  USING (auth.role() = 'service_role');

-- Marketplace transactions: buyers and vendors can see their own
CREATE POLICY "Buyers can view own transactions"
  ON marketplace_transactions FOR SELECT
  USING (auth.uid() = buyer_id);

CREATE POLICY "Vendors can view own sales"
  ON marketplace_transactions FOR SELECT
  USING (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Service role manages transactions"
  ON marketplace_transactions FOR ALL
  USING (auth.role() = 'service_role');

-- Payouts: vendors can view their own
CREATE POLICY "Vendors can view own payouts"
  ON marketplace_payouts FOR SELECT
  USING (vendor_id IN (SELECT id FROM vendor_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Service role manages payouts"
  ON marketplace_payouts FOR ALL
  USING (auth.role() = 'service_role');

-- Payment methods: users can manage their own
CREATE POLICY "Users can view own payment methods"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment methods"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment methods"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages payment methods"
  ON payment_methods FOR ALL
  USING (auth.role() = 'service_role');

-- ── Updated_at triggers ──
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER vendor_profiles_updated_at
    BEFORE UPDATE ON vendor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER marketplace_transactions_updated_at
    BEFORE UPDATE ON marketplace_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER marketplace_payouts_updated_at
    BEFORE UPDATE ON marketplace_payouts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER payment_methods_updated_at
    BEFORE UPDATE ON payment_methods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
