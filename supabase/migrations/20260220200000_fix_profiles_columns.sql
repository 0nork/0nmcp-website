-- Migration: fix_profiles_columns
-- Description: Add missing full_name and company columns to profiles table.
--   The handle_new_user() trigger and the entire 0nmcp-website codebase reference
--   full_name and company, but the original marketplace migration (001) created
--   the table with display_name instead. This migration:
--   1. Adds full_name and company columns
--   2. Copies existing display_name values into full_name
--   3. Re-creates handle_new_user() trigger to use correct columns
-- Author: supabase-db-manager
-- Date: 2026-02-20

-- ============================================================
-- 1. Add missing columns
-- ============================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS company TEXT;

-- ============================================================
-- 2. Copy existing display_name data into full_name
-- ============================================================

UPDATE profiles
SET full_name = display_name
WHERE full_name IS NULL AND display_name IS NOT NULL;

-- ============================================================
-- 3. Re-create the handle_new_user() trigger function
--    Uses full_name (matches codebase expectations) and company
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company, onboarding_completed, onboarding_step)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    false,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate the trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
