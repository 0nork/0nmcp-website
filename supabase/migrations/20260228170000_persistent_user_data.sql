-- Migration: 20260228170000_persistent_user_data.sql
-- Purpose: Persist user console flows, history, operations; fix user_vaults;
--          add reply_count trigger; create courses, enrollments, lesson_progress,
--          community_reactions, converted_workflows tables.

-- ============================================================================
-- 1. user_console_flows — persists user workflows
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_console_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger TEXT NOT NULL DEFAULT 'manual',
  actions TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_console_flows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "flows_own_read" ON public.user_console_flows FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "flows_own_insert" ON public.user_console_flows FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "flows_own_update" ON public.user_console_flows FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "flows_own_delete" ON public.user_console_flows FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_console_flows_user ON public.user_console_flows(user_id);


-- ============================================================================
-- 2. user_console_history — persists activity log
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_console_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_console_history ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "history_own_read" ON public.user_console_history FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "history_own_insert" ON public.user_console_history FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "history_own_delete" ON public.user_console_history FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_console_history_user ON public.user_console_history(user_id);
CREATE INDEX IF NOT EXISTS idx_console_history_created ON public.user_console_history(created_at DESC);


-- ============================================================================
-- 3. user_console_operations — persists active operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_console_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'error')),
  trigger TEXT NOT NULL DEFAULT 'manual',
  actions TEXT[] DEFAULT '{}',
  services TEXT[] DEFAULT '{}',
  notifications TEXT[] DEFAULT '{}',
  frequency TEXT,
  workflow_data JSONB DEFAULT '{}',
  last_run TIMESTAMPTZ,
  run_count INT DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_console_operations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "ops_own_read" ON public.user_console_operations FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "ops_own_insert" ON public.user_console_operations FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "ops_own_update" ON public.user_console_operations FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "ops_own_delete" ON public.user_console_operations FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_console_ops_user ON public.user_console_operations(user_id);


-- ============================================================================
-- 4. Fix user_vaults — add missing UPDATE RLS policy and unique constraint
-- ============================================================================

-- Add UPDATE policy (currently missing)
DO $$ BEGIN
  CREATE POLICY "vaults_own_update" ON public.user_vaults FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add unique constraint to prevent duplicate service entries per user
DO $$ BEGIN
  ALTER TABLE public.user_vaults ADD CONSTRAINT uq_user_vaults_user_service UNIQUE (user_id, service_name);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;


-- ============================================================================
-- 5. Reply count trigger for community_threads
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_thread_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.community_threads
    SET reply_count = reply_count + 1,
        last_reply_at = NEW.created_at,
        updated_at = now()
    WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.community_threads
    SET reply_count = GREATEST(reply_count - 1, 0),
        updated_at = now()
    WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_thread_reply_count ON public.community_posts;
CREATE TRIGGER trg_thread_reply_count
  AFTER INSERT OR DELETE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_thread_reply_count();


-- ============================================================================
-- 6. Create missing tables (only if they don't exist)
-- ============================================================================

-- ---------- courses ----------

CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  tier_required TEXT DEFAULT 'free',
  is_published BOOLEAN DEFAULT false,
  lesson_count INT DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "courses_public_read" ON public.courses FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "courses_service_all" ON public.courses FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ---------- enrollments ----------

CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  progress INT DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "enrollments_own_read" ON public.enrollments FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "enrollments_own_insert" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "enrollments_own_update" ON public.enrollments FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "enrollments_service_all" ON public.enrollments FOR ALL USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_enrollments_user ON public.enrollments(user_id);


-- ---------- lesson_progress ----------

CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  lesson_slug TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, course_id, lesson_slug)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "lesson_progress_own_read" ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "lesson_progress_own_insert" ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "lesson_progress_own_update" ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);


-- ---------- community_reactions ----------

CREATE TABLE IF NOT EXISTS public.community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES public.community_threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK ((thread_id IS NOT NULL AND post_id IS NULL) OR (thread_id IS NULL AND post_id IS NOT NULL))
);

ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "reactions_public_read" ON public.community_reactions FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "reactions_own_insert" ON public.community_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "reactions_own_delete" ON public.community_reactions FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_reactions_thread ON public.community_reactions(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reactions_post ON public.community_reactions(post_id) WHERE post_id IS NOT NULL;


-- ---------- converted_workflows ----------

CREATE TABLE IF NOT EXISTS public.converted_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_platform TEXT NOT NULL,
  source_format TEXT,
  workflow JSONB NOT NULL,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.converted_workflows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "converted_own_read" ON public.converted_workflows FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "converted_own_insert" ON public.converted_workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "converted_own_delete" ON public.converted_workflows FOR DELETE USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_converted_workflows_user ON public.converted_workflows(user_id);


-- ============================================================================
-- 7. Reload PostgREST schema cache
-- ============================================================================

NOTIFY pgrst, 'reload schema';
