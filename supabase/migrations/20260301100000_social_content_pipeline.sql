-- ============================================================================
-- Social Content Pipeline — content_topics, content_queue, social_posts
-- ============================================================================

-- Topics the AI draws from to generate content
CREATE TABLE IF NOT EXISTS content_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  keywords TEXT[] DEFAULT '{}',
  platforms TEXT[] DEFAULT '{}',
  priority INT DEFAULT 5,
  times_used INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Generated content waiting to be posted
CREATE TABLE IF NOT EXISTS content_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  topic_id UUID REFERENCES content_topics(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'post',
  title TEXT,
  body TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'scheduled', 'posted', 'failed')),
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  posted_url TEXT,
  rejection_reason TEXT,
  generated_by TEXT DEFAULT 'claude',
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  edit_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Social post log (replaces in-memory mock)
CREATE TABLE IF NOT EXISTS social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  platforms TEXT[] DEFAULT '{}',
  hashtags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'scheduled')),
  results JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content analytics (for poster.ts logging)
CREATE TABLE IF NOT EXISTS content_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES content_queue(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_topics_active ON content_topics (is_active, priority DESC, times_used ASC);
CREATE INDEX IF NOT EXISTS idx_content_topics_platforms ON content_topics USING GIN (platforms);
CREATE INDEX IF NOT EXISTS idx_content_queue_status ON content_queue (status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_content_queue_user ON content_queue (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_social_posts_user ON social_posts (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics (content_id, created_at DESC);

-- RLS
ALTER TABLE content_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_analytics ENABLE ROW LEVEL SECURITY;

-- content_topics: public read, admin write (service role)
CREATE POLICY "topics_select" ON content_topics FOR SELECT USING (true);

-- content_queue: users see their own, service role sees all
CREATE POLICY "queue_select_own" ON content_queue FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "queue_insert_own" ON content_queue FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "queue_update_own" ON content_queue FOR UPDATE USING (auth.uid() = user_id);

-- social_posts: users see their own
CREATE POLICY "social_select_own" ON social_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "social_insert_own" ON social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- content_analytics: users see analytics for their content
CREATE POLICY "analytics_select" ON content_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM content_queue WHERE content_queue.id = content_analytics.content_id AND content_queue.user_id = auth.uid())
);

-- ── Seed content_topics ─────────────────────────────────────────────────────

INSERT INTO content_topics (title, description, category, keywords, platforms, priority) VALUES
  ('What is MCP and why it matters', 'Explain the Model Context Protocol and how 0nMCP implements it as a universal orchestrator.', 'education', ARRAY['MCP', 'AI', 'orchestration', 'API'], ARRAY['reddit', 'linkedin', 'dev_to'], 10),
  ('0nMCP vs Zapier comparison', 'Compare 0nMCP (free, open source, 819 tools) vs Zapier ($20-600/mo, closed source).', 'comparison', ARRAY['Zapier', 'automation', 'comparison', 'pricing'], ARRAY['reddit', 'linkedin'], 9),
  ('Getting started with 0nMCP in 5 minutes', 'Quick start tutorial: npm install, config, first workflow.', 'tutorial', ARRAY['tutorial', 'quickstart', 'npm', 'beginner'], ARRAY['reddit', 'dev_to'], 10),
  ('The .0n Standard explained', 'Introduce the .0n file format — universal config for AI workflows. SWITCH files, connections, etc.', 'education', ARRAY['.0n', 'standard', 'config', 'SWITCH'], ARRAY['reddit', 'linkedin', 'dev_to'], 8),
  ('Secure credential storage with 0nVault', 'How 0nVault uses AES-256-GCM + hardware fingerprinting for machine-bound encryption.', 'security', ARRAY['vault', 'encryption', 'security', 'credentials'], ARRAY['reddit', 'linkedin'], 8),
  ('Multi-party escrow with X25519 ECDH', 'Deep dive into 0nVault Container escrow system — up to 8 parties, per-layer access matrices.', 'security', ARRAY['escrow', 'encryption', 'X25519', 'patent'], ARRAY['reddit', 'linkedin'], 7),
  ('Building your first AI workflow', 'Step-by-step: create a workflow that connects Stripe + SendGrid + Slack.', 'tutorial', ARRAY['workflow', 'Stripe', 'SendGrid', 'Slack'], ARRAY['dev_to', 'reddit'], 9),
  ('0nMCP Engine: portable AI brain bundles', 'How to import credentials from .env/CSV/JSON and export configs for 7 AI platforms.', 'feature', ARRAY['engine', 'import', 'export', 'credentials'], ARRAY['reddit', 'dev_to'], 7),
  ('Pipeline vs Assembly Line vs Radial Burst', 'Explain the three-level execution model (patent pending) and when to use each.', 'education', ARRAY['pipeline', 'execution', 'architecture', 'patent'], ARRAY['linkedin', 'reddit'], 8),
  ('Self-hosting AI orchestration', 'Why self-hosted matters: data sovereignty, no vendor lock-in, zero recurring costs.', 'opinion', ARRAY['self-hosted', 'open-source', 'privacy', 'sovereignty'], ARRAY['reddit', 'linkedin'], 9),
  ('0nMCP for CRM automation', 'How to use 245 CRM tools for contact management, workflows, invoicing.', 'use-case', ARRAY['CRM', 'automation', 'contacts', 'invoicing'], ARRAY['linkedin'], 7),
  ('From Zapier to 0nMCP: migration guide', 'Step-by-step migration from Zapier/Make/n8n to 0nMCP using the converter.', 'tutorial', ARRAY['migration', 'Zapier', 'Make', 'n8n'], ARRAY['dev_to', 'reddit'], 8),
  ('Why we open-sourced our AI orchestrator', 'The business case for open-source AI infrastructure.', 'opinion', ARRAY['open-source', 'business', 'AI', 'infrastructure'], ARRAY['linkedin', 'reddit'], 8),
  ('0nMCP CLI: named runs and hotkeys', 'Power user guide to the 0nMCP CLI — shell mode, REPL, shortcuts.', 'tutorial', ARRAY['CLI', 'terminal', 'developer', 'productivity'], ARRAY['dev_to', 'reddit'], 6),
  ('Business deed transfer with 0nVault', 'How the deed system packages entire business digital assets into a single container.', 'feature', ARRAY['deed', 'transfer', 'business', 'vault'], ARRAY['linkedin'], 7),
  ('Connecting 48 services with one config file', 'Show how a single .0n SWITCH file replaces dozens of individual integrations.', 'feature', ARRAY['integration', 'config', 'services', 'SWITCH'], ARRAY['reddit', 'linkedin', 'dev_to'], 9),
  ('AI-powered content generation pipeline', 'How we use Claude to generate, review, and auto-post marketing content.', 'behind-the-scenes', ARRAY['content', 'AI', 'marketing', 'automation'], ARRAY['linkedin', 'dev_to'], 6),
  ('0nMCP App Builder: deploy full apps', 'Build and deploy complete applications using the 0nMCP application engine.', 'feature', ARRAY['app-builder', 'deploy', 'application', 'engine'], ARRAY['dev_to', 'reddit'], 7),
  ('The Seal of Truth: content-addressed integrity', 'How SHA3-256 content-addressed seals ensure tamper-proof container verification.', 'security', ARRAY['seal', 'integrity', 'SHA3', 'verification'], ARRAY['reddit'], 6),
  ('0nMCP marketplace: pay-per-execution model', 'How the marketplace works — $0.10/execution, no subscription, creators earn 70%.', 'business', ARRAY['marketplace', 'pricing', 'SaaS', 'creators'], ARRAY['linkedin', 'reddit'], 8)
ON CONFLICT DO NOTHING;
