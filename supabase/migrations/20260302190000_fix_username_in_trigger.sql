-- Migration: fix_username_in_trigger
-- Description: Add username column to handle_new_user() trigger to prevent NOT NULL violation on signup.
--   Username is derived from: user_metadata.username > email prefix (dots removed) > 'user_' + id prefix.
--   Also sets username column default to '' for safety.
-- Author: supabase-db-manager
-- Date: 2026-03-02

-- Set a safe default on username column
ALTER TABLE public.profiles ALTER COLUMN username SET DEFAULT '';

-- Recreate the trigger function with username included
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    company,
    username,
    role,
    plan,
    is_admin,
    onboarding_completed,
    onboarding_step
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '')),
      'user_' || LEFT(NEW.id::text, 8)
    ),
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

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
