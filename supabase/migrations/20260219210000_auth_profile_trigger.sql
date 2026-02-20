-- Auto-create profile row on new user signup
-- Fixes: new accounts had no profiles row, breaking middleware, onboarding, account page

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  company TEXT,
  bio TEXT,
  role TEXT CHECK (role IN ('developer','founder','agency','enterprise','hobbyist')),
  interests TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  mfa_enrolled BOOLEAN DEFAULT false,
  karma INT DEFAULT 0,
  reputation_level TEXT DEFAULT 'newcomer',
  onboarding_completed BOOLEAN DEFAULT false,
  onboarding_step INT DEFAULT 0,
  sponsor_tier TEXT,
  stripe_customer_id TEXT,
  is_persona BOOLEAN DEFAULT false,
  crm_community_contact_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies (idempotent with IF NOT EXISTS pattern via DO block)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_own_read') THEN
    CREATE POLICY profiles_own_read ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_own_update') THEN
    CREATE POLICY profiles_own_update ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_service_insert') THEN
    CREATE POLICY profiles_service_insert ON profiles FOR INSERT WITH CHECK (true);
  END IF;
END $$;

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company, onboarding_completed, onboarding_step)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    false,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any, then create
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Also create user_vaults if missing (referenced by onboarding + account page)
CREATE TABLE IF NOT EXISTS public.user_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  salt TEXT NOT NULL,
  key_hint TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_vaults ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_vaults' AND policyname = 'vaults_own_read') THEN
    CREATE POLICY vaults_own_read ON user_vaults FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_vaults' AND policyname = 'vaults_own_insert') THEN
    CREATE POLICY vaults_own_insert ON user_vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_vaults' AND policyname = 'vaults_own_delete') THEN
    CREATE POLICY vaults_own_delete ON user_vaults FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_vaults_user ON user_vaults(user_id);

-- Create workflow_files table if missing (referenced by account page)
CREATE TABLE IF NOT EXISTS public.workflow_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  step_count INT DEFAULT 0,
  services_used TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  execution_count INT DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  workflow_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workflow_files ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_files' AND policyname = 'wf_own_read') THEN
    CREATE POLICY wf_own_read ON workflow_files FOR SELECT USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_files' AND policyname = 'wf_own_insert') THEN
    CREATE POLICY wf_own_insert ON workflow_files FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_files' AND policyname = 'wf_own_update') THEN
    CREATE POLICY wf_own_update ON workflow_files FOR UPDATE USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_files' AND policyname = 'wf_own_delete') THEN
    CREATE POLICY wf_own_delete ON workflow_files FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workflow_files_owner ON workflow_files(owner_id);
