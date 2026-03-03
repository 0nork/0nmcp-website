-- Migration: oauth_profile_enrichment
-- Description: Add auth_provider column to profiles + update handle_new_user() trigger
--   to capture avatar_url, auth_provider, and better name fallbacks for OAuth signups.
--   ON CONFLICT: update avatar + provider for returning OAuth users.
-- Author: Claude
-- Date: 2026-03-03

-- Add auth_provider column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

-- Recreate the trigger function with OAuth support
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    company,
    username,
    avatar_url,
    auth_provider,
    role,
    plan,
    is_admin,
    onboarding_completed,
    onboarding_step
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'user_name',
      ''
    ),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'user_name',
      LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '')),
      'user_' || LEFT(NEW.id::text, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    'member',
    'free',
    false,
    false,
    0
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = CASE
      WHEN EXCLUDED.avatar_url != '' AND EXCLUDED.avatar_url IS NOT NULL
      THEN EXCLUDED.avatar_url
      ELSE profiles.avatar_url
    END,
    auth_provider = CASE
      WHEN EXCLUDED.auth_provider != 'email'
      THEN EXCLUDED.auth_provider
      ELSE profiles.auth_provider
    END,
    full_name = CASE
      WHEN profiles.full_name = '' OR profiles.full_name IS NULL
      THEN EXCLUDED.full_name
      ELSE profiles.full_name
    END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
