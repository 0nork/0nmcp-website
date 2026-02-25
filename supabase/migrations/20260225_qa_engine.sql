-- =============================================================================
-- QA Distribution Engine tables
-- =============================================================================
-- Multi-platform content generation, distribution, and tracking
-- =============================================================================

-- Content table: stores generated Q&A content
CREATE TABLE IF NOT EXISTS qa_content (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  keywords text[] DEFAULT '{}',
  platform text NOT NULL,
  title text,
  content text NOT NULL,
  quality_score numeric(3,2),
  reading_level text,
  backlinks text[] DEFAULT '{}',
  variant_index int DEFAULT 0,
  batch_id text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Distributions table: tracks where content has been posted
CREATE TABLE IF NOT EXISTS qa_distributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid REFERENCES qa_content(id) ON DELETE CASCADE,
  platform text NOT NULL,
  platform_url text,
  status text DEFAULT 'pending',
  response jsonb,
  distributed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Platforms table: platform configuration and rate limits
CREATE TABLE IF NOT EXISTS qa_platforms (
  id text PRIMARY KEY,
  name text NOT NULL,
  domain text,
  domain_authority int,
  max_daily_posts int DEFAULT 5,
  enabled boolean DEFAULT true,
  config jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qa_content_topic ON qa_content(topic);
CREATE INDEX IF NOT EXISTS idx_qa_content_platform ON qa_content(platform);
CREATE INDEX IF NOT EXISTS idx_qa_content_status ON qa_content(status);
CREATE INDEX IF NOT EXISTS idx_qa_content_batch ON qa_content(batch_id);
CREATE INDEX IF NOT EXISTS idx_qa_content_created ON qa_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_distributions_content ON qa_distributions(content_id);
CREATE INDEX IF NOT EXISTS idx_qa_distributions_platform ON qa_distributions(platform);
CREATE INDEX IF NOT EXISTS idx_qa_distributions_status ON qa_distributions(status);
CREATE INDEX IF NOT EXISTS idx_qa_distributions_created ON qa_distributions(created_at DESC);

-- Row Level Security
ALTER TABLE qa_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_platforms ENABLE ROW LEVEL SECURITY;

-- Admin full access policies (admin-only tables, no public access)
CREATE POLICY "Admin full access on qa_content" ON qa_content FOR ALL USING (true);
CREATE POLICY "Admin full access on qa_distributions" ON qa_distributions FOR ALL USING (true);
CREATE POLICY "Admin full access on qa_platforms" ON qa_platforms FOR ALL USING (true);

-- Seed the platforms table with initial data
INSERT INTO qa_platforms (id, name, domain, domain_authority, max_daily_posts, enabled, config)
VALUES
  ('quora', 'Quora', 'quora.com', 93, 3, true, '{"format": "markdown", "linkPolicy": "moderate"}'),
  ('reddit', 'Reddit', 'reddit.com', 99, 5, true, '{"format": "markdown", "linkPolicy": "strict"}'),
  ('poe', 'Poe (Quora AI)', 'poe.com', 75, 10, true, '{"format": "markdown", "linkPolicy": "none"}'),
  ('warrior_forum', 'Warrior Forum', 'warriorforum.com', 72, 2, true, '{"format": "bbcode", "linkPolicy": "generous"}'),
  ('indiehackers', 'Indie Hackers', 'indiehackers.com', 78, 3, true, '{"format": "markdown", "linkPolicy": "moderate"}'),
  ('growthhackers', 'GrowthHackers', 'growthhackers.com', 68, 3, true, '{"format": "markdown", "linkPolicy": "moderate"}'),
  ('medium', 'Medium', 'medium.com', 96, 2, true, '{"format": "html", "linkPolicy": "generous"}'),
  ('hackernews', 'Hacker News', 'news.ycombinator.com', 92, 2, true, '{"format": "plain", "linkPolicy": "strict"}'),
  ('producthunt', 'Product Hunt', 'producthunt.com', 90, 1, true, '{"format": "markdown", "linkPolicy": "generous"}'),
  ('dev_to', 'Dev.to', 'dev.to', 85, 3, true, '{"format": "markdown", "linkPolicy": "generous"}'),
  ('hashnode', 'Hashnode', 'hashnode.com', 82, 3, true, '{"format": "markdown", "linkPolicy": "generous"}'),
  ('linkedin', 'LinkedIn', 'linkedin.com', 98, 5, true, '{"format": "plain", "linkPolicy": "moderate"}')
ON CONFLICT (id) DO NOTHING;

-- Updated_at trigger for qa_content
CREATE OR REPLACE FUNCTION update_qa_content_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER qa_content_updated_at
  BEFORE UPDATE ON qa_content
  FOR EACH ROW
  EXECUTE FUNCTION update_qa_content_updated_at();
