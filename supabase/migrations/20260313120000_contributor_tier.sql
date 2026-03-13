-- Contributor tier support: vendor columns + performance indexes
-- Ensures profiles support vendor tracking and vendor_profiles default to 15% fee

-- Add vendor tracking columns to profiles (if not already present)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_vendor BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vendor_status TEXT DEFAULT NULL;

-- Update default vendor fee to 15% (Contributor tier base rate)
ALTER TABLE vendor_profiles
  ALTER COLUMN application_fee_percent SET DEFAULT 15;

-- Performance indexes for plan-based queries and vendor lookups
CREATE INDEX IF NOT EXISTS idx_profiles_plan ON profiles(plan);
CREATE INDEX IF NOT EXISTS idx_profiles_is_vendor ON profiles(is_vendor) WHERE is_vendor = TRUE;
CREATE INDEX IF NOT EXISTS idx_vendor_profiles_active ON vendor_profiles(is_active) WHERE is_active = TRUE;
