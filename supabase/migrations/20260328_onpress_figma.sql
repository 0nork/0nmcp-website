-- OnPress + Figma OAuth tables
-- Migration: 20260328_onpress_figma.sql

-- ═══════════════════════════════════════════════════════════════
-- Figma OAuth connections (encrypted tokens via Vault)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.figma_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  figma_user_id TEXT NOT NULL,
  handle TEXT,
  email TEXT,
  encrypted_tokens TEXT NOT NULL,
  iv TEXT NOT NULL,
  salt TEXT NOT NULL,
  scopes TEXT[] NOT NULL DEFAULT '{}',
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_refreshed_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  CONSTRAINT figma_connections_user_unique UNIQUE (user_id)
);

ALTER TABLE figma_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own figma connection"
  ON figma_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- Figma CSRF state table (for OAuth flow)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.figma_oauth_states (
  state TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  used BOOLEAN NOT NULL DEFAULT false
);

CREATE INDEX IF NOT EXISTS figma_oauth_states_created_idx
  ON figma_oauth_states(created_at);

-- Auto-cleanup expired states (older than 10 minutes)
CREATE OR REPLACE FUNCTION clean_expired_figma_states()
RETURNS void AS $$
  DELETE FROM figma_oauth_states
  WHERE created_at < now() - interval '10 minutes';
$$ LANGUAGE sql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════
-- OnPress projects
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.onpress_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  figma_file_key TEXT NOT NULL,
  figma_file_name TEXT,
  generation_type TEXT DEFAULT 'theme' CHECK (generation_type IN ('theme', 'plugin')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'extracting', 'extracted', 'generating', 'completed', 'error')),
  config JSONB DEFAULT '{}',
  design_system JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE onpress_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own onpress projects"
  ON onpress_projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ═══════════════════════════════════════════════════════════════
-- OnPress generations (each build attempt)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.onpress_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES onpress_projects(id) ON DELETE CASCADE,
  version INT DEFAULT 1,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error')),
  zip_path TEXT,
  file_manifest JSONB DEFAULT '{}',
  error_log TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE onpress_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own onpress generations"
  ON onpress_generations FOR ALL
  USING (project_id IN (SELECT id FROM onpress_projects WHERE user_id = auth.uid()));
