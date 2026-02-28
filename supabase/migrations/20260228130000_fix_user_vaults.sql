-- Migration: fix_user_vaults
-- Description: Adds all missing columns to user_vaults table. The table may have
--   been created by a prior migration or manual SQL with a different schema, causing
--   CREATE TABLE IF NOT EXISTS in later migrations to silently skip the correct columns.
--   This migration uses ALTER TABLE ADD COLUMN IF NOT EXISTS to safely backfill every
--   required column without dropping existing data.
-- Author: supabase-db-manager
-- Date: 2026-02-28

-- =============================================================================
-- 1. ADD MISSING COLUMNS (idempotent — IF NOT EXISTS on each)
-- =============================================================================

ALTER TABLE public.user_vaults ADD COLUMN IF NOT EXISTS encrypted_key TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_vaults ADD COLUMN IF NOT EXISTS iv TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_vaults ADD COLUMN IF NOT EXISTS salt TEXT NOT NULL DEFAULT '';
ALTER TABLE public.user_vaults ADD COLUMN IF NOT EXISTS key_hint TEXT;
ALTER TABLE public.user_vaults ADD COLUMN IF NOT EXISTS service_name TEXT NOT NULL DEFAULT 'unknown';
ALTER TABLE public.user_vaults ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Also ensure the standard columns exist (user_id, created_at) in case the
-- original table was extremely minimal
ALTER TABLE public.user_vaults ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.user_vaults ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

-- =============================================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE public.user_vaults ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 3. RLS POLICIES (idempotent — check before create)
-- =============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_vaults'
      AND policyname = 'vaults_own_read'
  ) THEN
    CREATE POLICY vaults_own_read ON public.user_vaults
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_vaults'
      AND policyname = 'vaults_own_insert'
  ) THEN
    CREATE POLICY vaults_own_insert ON public.user_vaults
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'user_vaults'
      AND policyname = 'vaults_own_delete'
  ) THEN
    CREATE POLICY vaults_own_delete ON public.user_vaults
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;

-- =============================================================================
-- 4. INDEX (idempotent)
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_user_vaults_user ON public.user_vaults(user_id);

-- =============================================================================
-- 5. NOTIFY PostgREST to refresh its schema cache
-- =============================================================================

NOTIFY pgrst, 'reload schema';
