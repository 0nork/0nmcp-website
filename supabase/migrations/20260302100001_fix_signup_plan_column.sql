-- Migration: fix_signup_plan_column
-- Description: Fix "Database error saving new user" on signup.
--   Previous trigger function was missing the `plan` column and `SET search_path = public`.
--   The profiles_role_check constraint was re-blocking 'member' inserts.
-- Author: supabase-db-manager
-- Date: 2026-03-02

-- 1. Add plan column if missing
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- 2. Add is_admin column if missing (idempotent)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 3. Drop conflicting CHECK constraint on role (idempotent)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 4. Make role nullable with 'member' default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'member';
DO $$ BEGIN
  ALTER TABLE profiles ALTER COLUMN role DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 5. Recreate trigger function — robust version with plan column and search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, company, role, plan, is_admin,
    onboarding_completed, onboarding_step
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    'member',
    'free',
    false,
    false,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 6. Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
