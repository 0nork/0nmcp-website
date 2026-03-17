-- Fix: Username collision during signup causes "Database error saving new user"
-- The UNIQUE constraint on username + deterministic generation from email causes
-- failures when two users have the same email prefix.
-- Solution: Append a random suffix to make usernames unique on conflict.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix TEXT;
BEGIN
  -- Generate base username from metadata or email
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '')),
    'user_' || LEFT(NEW.id::text, 8)
  );

  -- Try the base username first, if taken append random suffix
  final_username := base_username;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != NEW.id) THEN
    suffix := LEFT(md5(random()::text), 4);
    final_username := base_username || '_' || suffix;
  END IF;

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
    final_username,
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
