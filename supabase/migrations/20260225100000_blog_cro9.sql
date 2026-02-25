-- Blog & CRO9 SEO Engine tables
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text NOT NULL,
  meta_description text,
  target_query text,
  bucket text,
  word_count int,
  status text DEFAULT 'draft',
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  query text NOT NULL,
  impressions int DEFAULT 0,
  clicks int DEFAULT 0,
  ctr numeric(5,4) DEFAULT 0,
  position numeric(5,2) DEFAULT 0,
  score numeric(5,3),
  bucket text,
  factors jsonb,
  run_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id uuid REFERENCES seo_pages(id),
  bucket text NOT NULL,
  brief jsonb,
  status text DEFAULT 'pending',
  outcome jsonb,
  evaluated_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  impressions numeric(5,4) DEFAULT 0.25,
  position numeric(5,4) DEFAULT 0.25,
  ctr_gap numeric(5,4) DEFAULT 0.25,
  conversions numeric(5,4) DEFAULT 0.15,
  freshness numeric(5,4) DEFAULT 0.10,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seo_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pages_analyzed int DEFAULT 0,
  actions_generated int DEFAULT 0,
  weight_id uuid REFERENCES seo_weights(id),
  status text DEFAULT 'running',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_seo_pages_run ON seo_pages(run_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_bucket ON seo_pages(bucket);
CREATE INDEX IF NOT EXISTS idx_seo_actions_page ON seo_actions(page_id);

-- RLS
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access on blog_posts" ON blog_posts FOR ALL USING (true);
CREATE POLICY "Admin full access on seo_pages" ON seo_pages FOR ALL USING (true);
CREATE POLICY "Admin full access on seo_actions" ON seo_actions FOR ALL USING (true);
CREATE POLICY "Admin full access on seo_weights" ON seo_weights FOR ALL USING (true);
CREATE POLICY "Admin full access on seo_runs" ON seo_runs FOR ALL USING (true);

-- Insert default weights
INSERT INTO seo_weights (impressions, position, ctr_gap, conversions, freshness, active)
VALUES (0.25, 0.25, 0.25, 0.15, 0.10, true)
ON CONFLICT DO NOTHING;
