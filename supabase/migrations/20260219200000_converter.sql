-- 008_converter.sql — User workflows table for Brain Transplant converter

CREATE TABLE IF NOT EXISTS user_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_platform TEXT NOT NULL CHECK (source_platform IN ('openai', 'gemini', 'openclaw', 'claude-code', 'unknown')),
  source_format TEXT,
  workflow JSONB NOT NULL,
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_workflows_user ON user_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workflows_platform ON user_workflows(source_platform);

ALTER TABLE user_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workflows"
  ON user_workflows FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workflows"
  ON user_workflows FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows"
  ON user_workflows FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows"
  ON user_workflows FOR DELETE
  USING (auth.uid() = user_id);
