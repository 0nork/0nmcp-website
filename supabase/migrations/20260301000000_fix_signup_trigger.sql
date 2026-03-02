-- 0nmcp.com — Fix signup "Database error saving new user"
-- Root cause: CHECK constraint on profiles.role conflicts between migrations
-- Also adds is_admin column for admin system

-- 1. Drop conflicting CHECK constraint on role
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Make role nullable with 'member' default
ALTER TABLE profiles ALTER COLUMN role SET DEFAULT 'member';
DO $$ BEGIN
  ALTER TABLE profiles ALTER COLUMN role DROP NOT NULL;
EXCEPTION WHEN others THEN NULL;
END $$;

-- 3. Add admin column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 4. Set mike@rocketopp.com as admin
UPDATE profiles SET is_admin = true WHERE email = 'mike@rocketopp.com';

-- 5. Recreate trigger function — includes role + is_admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, email, full_name, company, role, is_admin,
    onboarding_completed, onboarding_step
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    'member',
    false,
    false,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
