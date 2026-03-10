-- ============================================================
-- Marketplace Builder — AI Assets, Store Reviews, Vendor Enhancements
-- ============================================================
-- Adds:
-- 1. builder_assets — AI-generated marketing assets (landing pages, emails, forms, product pages)
-- 2. store_reviews — Buyer ratings and reviews for listings
-- 3. New columns on store_listings (asset_type, average_rating, review_count, is_featured)
-- 4. New columns on vendor_profiles (vendor_slug, vendor_bio, vendor_avatar_url)
-- ============================================================

-- ── Builder Assets ──
-- Stores AI-generated marketing assets (HTML + config)
CREATE TABLE IF NOT EXISTS builder_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('landing_page', 'email', 'form', 'product_page')),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  config JSONB DEFAULT '{}',
  html TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version INTEGER DEFAULT 1,
  listing_id UUID REFERENCES store_listings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── Store Reviews ──
-- Buyer ratings and reviews for marketplace listings
CREATE TABLE IF NOT EXISTS store_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES store_listings(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_verified_purchase BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(buyer_id, listing_id)
);

-- ── Extend store_listings ──
DO $$ BEGIN
  ALTER TABLE store_listings ADD COLUMN IF NOT EXISTS asset_type TEXT DEFAULT 'workflow';
  ALTER TABLE store_listings ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3,2);
  ALTER TABLE store_listings ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;
  ALTER TABLE store_listings ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── Extend vendor_profiles ──
DO $$ BEGIN
  ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS vendor_slug TEXT UNIQUE;
  ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS vendor_bio TEXT;
  ALTER TABLE vendor_profiles ADD COLUMN IF NOT EXISTS vendor_avatar_url TEXT;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

-- ── RLS: Builder Assets ──
ALTER TABLE builder_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own builder assets"
  ON builder_assets FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access builder assets"
  ON builder_assets FOR ALL
  USING (auth.role() = 'service_role');

-- ── RLS: Store Reviews ──
ALTER TABLE store_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read reviews"
  ON store_reviews FOR SELECT
  USING (true);

CREATE POLICY "Buyers insert own reviews"
  ON store_reviews FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Buyers update own reviews"
  ON store_reviews FOR UPDATE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Buyers delete own reviews"
  ON store_reviews FOR DELETE
  USING (auth.uid() = buyer_id);

CREATE POLICY "Service role manages reviews"
  ON store_reviews FOR ALL
  USING (auth.role() = 'service_role');

-- ── Indexes ──
CREATE INDEX IF NOT EXISTS idx_builder_assets_user ON builder_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_builder_assets_type ON builder_assets(asset_type);
CREATE INDEX IF NOT EXISTS idx_builder_assets_status ON builder_assets(status);
CREATE INDEX IF NOT EXISTS idx_store_reviews_listing ON store_reviews(listing_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_buyer ON store_reviews(buyer_id);
CREATE INDEX IF NOT EXISTS idx_store_reviews_rating ON store_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_store_listings_asset_type ON store_listings(asset_type);
CREATE INDEX IF NOT EXISTS idx_store_listings_featured ON store_listings(is_featured) WHERE is_featured = true;

-- ── Updated_at Triggers ──
DO $$ BEGIN
  CREATE TRIGGER set_builder_assets_updated_at
    BEFORE UPDATE ON builder_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER set_store_reviews_updated_at
    BEFORE UPDATE ON store_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
