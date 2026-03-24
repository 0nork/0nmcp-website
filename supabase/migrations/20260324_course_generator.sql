-- AI Course Generator: course_drafts table
-- Stores generated course structures, editing state, and CRM publish metadata

CREATE TABLE IF NOT EXISTS course_drafts (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id             TEXT NOT NULL,
  user_id                 TEXT,

  -- Intake fields
  course_title            TEXT NOT NULL,
  course_subtitle         TEXT,
  target_audience         TEXT,
  skill_level             TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  course_goal             TEXT,
  course_category         TEXT,
  estimated_duration      INTEGER,         -- minutes
  module_count            INTEGER DEFAULT 3,
  lessons_per_module      INTEGER DEFAULT 3,
  include_quizzes         BOOLEAN DEFAULT true,
  include_assignments     BOOLEAN DEFAULT false,
  tone                    TEXT DEFAULT 'professional',
  keywords                TEXT[],
  additional_instructions TEXT,

  -- Generation output
  generated_structure     JSONB,           -- full course tree: modules > lessons > content
  generation_status       TEXT DEFAULT 'pending' CHECK (generation_status IN ('pending', 'generating', 'completed', 'failed')),
  generation_error        TEXT,
  generated_at            TIMESTAMPTZ,
  generation_model        TEXT,

  -- Publish state
  publish_status          TEXT DEFAULT 'draft' CHECK (publish_status IN ('draft', 'publishing', 'published', 'failed')),
  crm_product_id          TEXT,
  crm_course_url          TEXT,
  published_at            TIMESTAMPTZ,
  publish_error           TEXT,

  -- Timestamps
  created_at              TIMESTAMPTZ DEFAULT now(),
  updated_at              TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_course_drafts_location   ON course_drafts (location_id);
CREATE INDEX idx_course_drafts_status     ON course_drafts (generation_status);
CREATE INDEX idx_course_drafts_publish    ON course_drafts (publish_status);
CREATE INDEX idx_course_drafts_created    ON course_drafts (created_at DESC);

-- RLS
ALTER TABLE course_drafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on course_drafts"
  ON course_drafts
  FOR ALL
  USING (true)
  WITH CHECK (true);
