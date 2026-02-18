-- 006: Onboarding flow columns
-- Adds onboarding tracking to profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('developer','founder','agency','enterprise','hobbyist')),
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}';

-- Partial index for fast lookup of users still onboarding
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON profiles(id) WHERE onboarding_completed = false;
