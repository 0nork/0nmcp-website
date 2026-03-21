-- Migration: lessons_table
-- Description: Create lessons table for course content + rename spark tables to run tables
-- Author: supabase-db-manager
-- Date: 2026-03-21

-- UP

-- Lessons table — course content
CREATE TABLE IF NOT EXISTS lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_markdown TEXT NOT NULL DEFAULT '',
  order_index INTEGER NOT NULL DEFAULT 0,
  duration_minutes INTEGER DEFAULT 5,
  is_free_preview BOOLEAN DEFAULT false,
  video_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, order_index);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read published lessons" ON lessons FOR SELECT USING (true);
CREATE POLICY "Service role full access" ON lessons FOR ALL USING (true) WITH CHECK (true);

-- Also rename spark tables to run tables
ALTER TABLE IF EXISTS spark_balances RENAME TO run_balances;
ALTER TABLE IF EXISTS spark_transactions RENAME TO run_transactions;
ALTER TABLE IF EXISTS spark_packs RENAME TO run_packs;
