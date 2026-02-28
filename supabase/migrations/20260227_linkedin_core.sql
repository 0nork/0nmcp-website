-- LinkedIn Agentic Onboarding & Self-Optimizing Conversion System
-- PACG + LVOS + CUCIA + TAICD + AI Network Intelligence

-- ═══════════════════════════════════════════
-- 1. Members (LinkedIn-connected users)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS linkedin_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  linkedin_id TEXT NOT NULL UNIQUE,
  linkedin_access_token TEXT NOT NULL,
  linkedin_refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  linkedin_name TEXT NOT NULL,
  linkedin_headline TEXT,
  linkedin_industry TEXT,
  linkedin_profile_url TEXT,
  linkedin_avatar_url TEXT,
  archetype JSONB,
  onboarding_completed BOOLEAN DEFAULT false,
  automated_posting_enabled BOOLEAN DEFAULT false,
  posting_frequency TEXT DEFAULT 'weekly',
  last_post_at TIMESTAMPTZ,
  total_posts INTEGER DEFAULT 0,
  total_engagements INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_linkedin_members_user ON linkedin_members(user_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_members_linkedin ON linkedin_members(linkedin_id);
CREATE INDEX IF NOT EXISTS idx_linkedin_members_automated ON linkedin_members(automated_posting_enabled) WHERE automated_posting_enabled = true;

-- ═══════════════════════════════════════════
-- 2. LVOS Variants (follow-up question variants)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lvos_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_key TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  context_hint TEXT,
  alpha REAL DEFAULT 1.0,
  beta REAL DEFAULT 1.0,
  is_seed BOOLEAN DEFAULT false,
  parent_variant_id UUID REFERENCES lvos_variants(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lvos_variants_seed ON lvos_variants(is_seed) WHERE is_seed = true;

-- ═══════════════════════════════════════════
-- 3. LVOS Variant Performance
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lvos_variant_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES lvos_variants(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES linkedin_members(id) ON DELETE CASCADE,
  was_selected BOOLEAN DEFAULT false,
  led_to_conversion BOOLEAN DEFAULT false,
  response_quality REAL DEFAULT 0.0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lvos_perf_variant ON lvos_variant_performance(variant_id);
CREATE INDEX IF NOT EXISTS idx_lvos_perf_member ON lvos_variant_performance(member_id);

-- ═══════════════════════════════════════════
-- 4. LVOS Selections (observation windows)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS lvos_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES linkedin_members(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES lvos_variants(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  response_text TEXT,
  conversion_event TEXT,
  observation_window_start TIMESTAMPTZ DEFAULT now(),
  observation_window_end TIMESTAMPTZ DEFAULT (now() + interval '48 hours'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lvos_selections_member ON lvos_selections(member_id);
CREATE INDEX IF NOT EXISTS idx_lvos_selections_variant ON lvos_selections(variant_id);
CREATE INDEX IF NOT EXISTS idx_lvos_selections_window ON lvos_selections(observation_window_end)
  WHERE conversion_event IS NULL;

-- ═══════════════════════════════════════════
-- 5. CUCIA Segment Model
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS cucia_segment_model (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  segment_key TEXT NOT NULL UNIQUE,
  sample_size INTEGER DEFAULT 0,
  avg_conversion_rate REAL DEFAULT 0.0,
  top_performing_variants JSONB DEFAULT '[]',
  archetype_distribution JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cucia_segment ON cucia_segment_model(segment_key);

-- ═══════════════════════════════════════════
-- 6. AI Interactions (network intelligence)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ai_system_identifier TEXT NOT NULL,
  manifest_version TEXT NOT NULL DEFAULT '1.0',
  tool_called TEXT NOT NULL,
  input_params JSONB DEFAULT '{}',
  execution_receipt_id TEXT,
  interaction_quality REAL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_system ON ai_interactions(ai_system_identifier);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_tool ON ai_interactions(tool_called);
CREATE INDEX IF NOT EXISTS idx_ai_interactions_date ON ai_interactions(created_at DESC);

-- ═══════════════════════════════════════════
-- 7. Tool Calls (execution log)
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS linkedin_tool_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_name TEXT NOT NULL,
  member_id UUID REFERENCES linkedin_members(id) ON DELETE SET NULL,
  input_params JSONB DEFAULT '{}',
  output_result JSONB DEFAULT '{}',
  execution_time_ms INTEGER DEFAULT 0,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tool_calls_name ON linkedin_tool_calls(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_calls_member ON linkedin_tool_calls(member_id);
CREATE INDEX IF NOT EXISTS idx_tool_calls_date ON linkedin_tool_calls(created_at DESC);

-- ═══════════════════════════════════════════
-- 8. Automated Posts
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS automated_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES linkedin_members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  linkedin_post_id TEXT,
  posted_at TIMESTAMPTZ,
  engagement_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_automated_posts_member ON automated_posts(member_id);
CREATE INDEX IF NOT EXISTS idx_automated_posts_date ON automated_posts(posted_at DESC);

-- ═══════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════

ALTER TABLE linkedin_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lvos_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE lvos_variant_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE lvos_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE cucia_segment_model ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_tool_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_posts ENABLE ROW LEVEL SECURITY;

-- Users can read their own member record
CREATE POLICY "Users read own linkedin member"
  ON linkedin_members FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own member record
CREATE POLICY "Users update own linkedin member"
  ON linkedin_members FOR UPDATE
  USING (auth.uid() = user_id);

-- Service role full access on all tables (API routes use service role)
CREATE POLICY "Service role full access on linkedin_members"
  ON linkedin_members FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on lvos_variants"
  ON lvos_variants FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on lvos_variant_performance"
  ON lvos_variant_performance FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on lvos_selections"
  ON lvos_selections FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on cucia_segment_model"
  ON cucia_segment_model FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on ai_interactions"
  ON ai_interactions FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on linkedin_tool_calls"
  ON linkedin_tool_calls FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on automated_posts"
  ON automated_posts FOR ALL
  USING (true) WITH CHECK (true);

-- Public read on LVOS variants (needed for tool selection)
CREATE POLICY "Public read lvos variants"
  ON lvos_variants FOR SELECT
  USING (true);

-- Public read on CUCIA segment model (anonymized)
CREATE POLICY "Public read cucia segments"
  ON cucia_segment_model FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════
-- Seed LVOS Variants (8 seeds)
-- ═══════════════════════════════════════════
INSERT INTO lvos_variants (variant_key, question_text, context_hint, is_seed) VALUES
  ('seed_industry_insight', 'What''s one thing about your industry you wish more people understood?', 'Reveals domain expertise and passion points', true),
  ('seed_recent_win', 'What''s a recent win you''d like to share with your network?', 'Captures positive momentum and achievement style', true),
  ('seed_change_industry', 'If you could change one thing about how your industry works, what would it be?', 'Shows thought leadership and critical thinking', true),
  ('seed_best_advice', 'What''s the best career advice you''ve ever received?', 'Reveals values and mentorship orientation', true),
  ('seed_exciting_trend', 'What trend in your field are you most excited about?', 'Identifies forward-thinking and innovation focus', true),
  ('seed_challenge_overcome', 'Tell me about a challenge you recently overcame at work.', 'Shows resilience and problem-solving style', true),
  ('seed_surprising_learning', 'What''s something you''ve learned this month that surprised you?', 'Captures curiosity and growth mindset', true),
  ('seed_advice_newcomer', 'If you could give one piece of advice to someone starting in your field, what would it be?', 'Reveals mentoring voice and core beliefs', true)
ON CONFLICT (variant_key) DO NOTHING;

-- ═══════════════════════════════════════════
-- Function: Update updated_at timestamp
-- ═══════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_linkedin_member_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_linkedin_member_updated
  BEFORE UPDATE ON linkedin_members
  FOR EACH ROW
  EXECUTE FUNCTION update_linkedin_member_timestamp();

-- Function: Increment post count
CREATE OR REPLACE FUNCTION increment_member_posts(mid UUID)
RETURNS void AS $$
BEGIN
  UPDATE linkedin_members
  SET total_posts = total_posts + 1, last_post_at = now(), updated_at = now()
  WHERE id = mid;
END;
$$ LANGUAGE plpgsql;
