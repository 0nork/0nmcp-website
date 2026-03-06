-- AI Brain Learning Layer — Foundation tables for autonomous learning
-- The AI reads from and writes to these tables on every interaction

-- User Intelligence Profiles — the living AI brain per user
CREATE TABLE IF NOT EXISTS user_intelligence_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Voice & Communication style
  voice_profile jsonb DEFAULT '{
    "avg_sentence_length": 0,
    "vocabulary_level": "general",
    "tone": "neutral",
    "emoji_usage": "unknown",
    "hashtag_style": "unknown",
    "signature_phrases": [],
    "avoided_phrases": [],
    "sample_posts": []
  }'::jsonb,

  -- Company/professional context
  company_profile jsonb DEFAULT '{}'::jsonb,

  -- Relationship intelligence (contacts, VIPs, prospects)
  relationship_graph jsonb DEFAULT '{}'::jsonb,

  -- Behavioral patterns learned from usage
  behavioral_data jsonb DEFAULT '{
    "best_active_times": [],
    "content_types_that_perform": [],
    "approval_rate": 0,
    "avg_response_time_ms": 0,
    "preferred_features": [],
    "session_patterns": []
  }'::jsonb,

  -- Corrections log — the closed-loop learning feed
  corrections_log jsonb DEFAULT '[]'::jsonb,

  -- Active goals and context
  active_goals jsonb DEFAULT '[]'::jsonb,

  -- Profile completeness score 0-100
  profile_completeness integer DEFAULT 0,

  -- Timestamps
  last_learning_run timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Behavioral signals — raw event stream that feeds the UIP
CREATE TABLE IF NOT EXISTS ai_behavioral_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,

  -- What happened
  signal_type text NOT NULL, -- 'chat', 'post_approved', 'post_edited', 'post_rejected', 'feature_used', 'page_viewed', 'workflow_run', 'correction'
  signal_data jsonb DEFAULT '{}'::jsonb,

  -- Learning weight (corrections > rejections > edits > approvals > views)
  weight numeric(4,2) DEFAULT 1.0,

  -- Source context
  source text DEFAULT 'console', -- 'console', 'chat', 'extension', 'api', 'builder', 'store'
  page_context text, -- which page/view the signal came from
  session_id text, -- group signals by session

  -- Timestamp
  created_at timestamptz DEFAULT now()
);

-- AI Brain Config — master configuration for the AI system (admin-only)
CREATE TABLE IF NOT EXISTS ai_brain_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  description text,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Subscription tiers for products (Chrome Extension, etc.)
CREATE TABLE IF NOT EXISTS product_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id text NOT NULL, -- 'social-engine', 'agent', etc.
  tier text NOT NULL DEFAULT 'free', -- 'free', 'creator', 'operator', 'agency', 'enterprise'
  status text NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'past_due', 'trialing'
  stripe_subscription_id text,
  stripe_customer_id text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  trial_end timestamptz,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Usage tracking per feature per billing period
CREATE TABLE IF NOT EXISTS feature_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL, -- 'ai_posts', 'voice_memos', 'channels', 'workflows', 'disputes'
  product_id text NOT NULL DEFAULT 'social-engine',
  count integer DEFAULT 0,
  period_start date NOT NULL DEFAULT CURRENT_DATE,
  period_end date NOT NULL DEFAULT (CURRENT_DATE + interval '1 month')::date,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, feature, product_id, period_start)
);

-- RLS policies
ALTER TABLE user_intelligence_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_behavioral_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_brain_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own intelligence profile
CREATE POLICY "own_uip_select" ON user_intelligence_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_uip_insert" ON user_intelligence_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_uip_update" ON user_intelligence_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own signals (read via service role for aggregation)
CREATE POLICY "own_signals_insert" ON ai_behavioral_signals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_signals_select" ON ai_behavioral_signals FOR SELECT USING (auth.uid() = user_id);

-- AI brain config: read-only for authenticated users, write via service role
CREATE POLICY "brain_config_read" ON ai_brain_config FOR SELECT TO authenticated USING (true);

-- Users see their own subscriptions
CREATE POLICY "own_subs_select" ON product_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_subs_insert" ON product_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_subs_update" ON product_subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Users see their own usage
CREATE POLICY "own_usage_select" ON feature_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own_usage_insert" ON feature_usage FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own_usage_update" ON feature_usage FOR UPDATE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_signals_user_type ON ai_behavioral_signals(user_id, signal_type);
CREATE INDEX idx_signals_created ON ai_behavioral_signals(created_at DESC);
CREATE INDEX idx_subs_user_product ON product_subscriptions(user_id, product_id);
CREATE INDEX idx_usage_user_period ON feature_usage(user_id, period_start);
CREATE INDEX idx_uip_updated ON user_intelligence_profiles(updated_at DESC);

-- Insert default AI brain config
INSERT INTO ai_brain_config (config_key, config_value, description) VALUES
  ('system_prompt', '{"base": "You are 0n, the AI brain of the 0nMCP ecosystem. You learn from every interaction, remember user preferences, and get smarter over time. You are direct, technical, and helpful. You never sound like a generic AI — you sound like someone who builds infrastructure.", "version": "2.0.0"}', 'Master system prompt for the 0n AI'),
  ('learning_config', '{"signal_retention_days": 90, "corrections_weight": 3.0, "rejections_weight": 2.0, "approvals_weight": 1.0, "min_signals_for_profile": 10, "auto_update_interval_hours": 24}', 'AI learning engine configuration'),
  ('voice_defaults', '{"tone": "direct", "vocabulary_level": "technical", "emoji_usage": "never", "avoided_phrases": ["game-changer", "leverage", "synergy", "disruption"]}', 'Default voice profile for new users'),
  ('feature_limits', '{"free": {"ai_posts": 10, "voice_memos": 3, "channels": 1, "workflows": 1, "disputes": 0, "competitors": 0}, "creator": {"ai_posts": -1, "voice_memos": -1, "channels": 3, "workflows": 5, "disputes": -1, "competitors": 3}, "operator": {"ai_posts": -1, "voice_memos": -1, "channels": 8, "workflows": -1, "disputes": -1, "competitors": -1}, "agency": {"ai_posts": -1, "voice_memos": -1, "channels": 8, "workflows": -1, "disputes": -1, "competitors": -1, "client_accounts": 10}, "enterprise": {"ai_posts": -1, "voice_memos": -1, "channels": -1, "workflows": -1, "disputes": -1, "competitors": -1, "client_accounts": -1}}', 'Feature limits per subscription tier (-1 = unlimited)')
ON CONFLICT (config_key) DO NOTHING;
