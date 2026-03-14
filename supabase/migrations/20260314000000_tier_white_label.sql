-- ============================================
-- Migration: Tier White-Label (Users & Locations)
-- 2026-03-14 — White-label user seats + locations
-- ============================================

-- Track white-label locations per account
CREATE TABLE IF NOT EXISTS user_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  domain TEXT,
  branding JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Track team seats per account
CREATE TABLE IF NOT EXISTS team_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'removed')),
  location_id UUID REFERENCES user_locations(id) ON DELETE SET NULL,
  invited_at TIMESTAMPTZ DEFAULT now(),
  accepted_at TIMESTAMPTZ
);

-- Add seat/location tracking to product_subscriptions
ALTER TABLE product_subscriptions
  ADD COLUMN IF NOT EXISTS extra_users INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS extra_locations INTEGER DEFAULT 0;

-- Migrate old plan names in profiles
UPDATE profiles SET plan = 'creator' WHERE plan = 'pro';
UPDATE profiles SET plan = 'operator' WHERE plan = 'team';
UPDATE profiles SET plan = 'agency' WHERE plan = 'contributor';

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_locations_owner ON user_locations(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_seats_owner ON team_seats(owner_id);
CREATE INDEX IF NOT EXISTS idx_team_seats_member ON team_seats(member_id);

-- RLS
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own locations" ON user_locations
  FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users manage own locations" ON user_locations
  FOR ALL USING (owner_id = auth.uid());

CREATE POLICY "Users read own seats" ON team_seats
  FOR SELECT USING (owner_id = auth.uid() OR member_id = auth.uid());

CREATE POLICY "Owners manage seats" ON team_seats
  FOR ALL USING (owner_id = auth.uid());
