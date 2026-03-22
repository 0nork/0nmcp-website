-- Fix: profiles.username unique constraint blocks signups when trigger inserts empty string
-- Solution: drop the unique constraint on username, make it nullable,
-- and update the trigger to generate a unique username from email

-- 1. Drop the unique constraint
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_username_key;

-- 2. Allow NULL usernames (don't force empty strings)
ALTER TABLE profiles ALTER COLUMN username DROP NOT NULL;

-- 3. Set empty usernames to NULL so they don't conflict
UPDATE profiles SET username = NULL WHERE username = '' OR username IS NULL;

-- 4. Add a partial unique index (only on non-null usernames)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON profiles(username) WHERE username IS NOT NULL;

-- 5. Replace the trigger function to generate usernames from email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'username', ''),
      split_part(NEW.email, '@', 1) || '-' || substr(NEW.id::text, 1, 4)
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), profiles.full_name),
    company = COALESCE(NULLIF(EXCLUDED.company, ''), profiles.company);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
