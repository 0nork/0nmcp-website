-- SERP keyword tracking for 0nmcp.com
-- Powered by Zenserp API, cron every other day

CREATE TABLE IF NOT EXISTS serp_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text NOT NULL,
  position integer,  -- null = not in top 100
  url text,          -- matching URL from results
  title text,
  description text,
  search_engine text DEFAULT 'google.com',
  device text DEFAULT 'desktop',
  location text DEFAULT 'United States',
  total_results bigint,
  featured_snippet boolean DEFAULT false,
  people_also_ask jsonb,
  related_searches jsonb,
  raw_result jsonb,   -- full Zenserp response for debugging
  tracked_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_serp_keyword ON serp_tracking(keyword);
CREATE INDEX IF NOT EXISTS idx_serp_tracked_at ON serp_tracking(tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_serp_keyword_date ON serp_tracking(keyword, tracked_at DESC);
CREATE INDEX IF NOT EXISTS idx_serp_position ON serp_tracking(position) WHERE position IS NOT NULL;

-- Keywords config table (which keywords to track)
CREATE TABLE IF NOT EXISTS serp_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword text UNIQUE NOT NULL,
  is_active boolean DEFAULT true,
  priority integer DEFAULT 5,  -- 1=highest, 10=lowest
  category text,               -- e.g. 'brand', 'feature', 'comparison'
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Seed with initial keywords to track
INSERT INTO serp_keywords (keyword, priority, category) VALUES
  ('0nmcp', 1, 'brand'),
  ('0nMCP install', 1, 'brand'),
  ('MCP server Claude', 2, 'feature'),
  ('Claude MCP tools', 2, 'feature'),
  ('Model Context Protocol server', 2, 'feature'),
  ('AI API orchestrator', 3, 'feature'),
  ('Claude plugins', 3, 'feature'),
  ('Claude AI tools', 3, 'feature'),
  ('best MCP server', 3, 'comparison'),
  ('Claude automation tools', 3, 'feature'),
  ('install MCP Claude', 2, 'brand'),
  ('Claude workflow automation', 4, 'feature'),
  ('AI tool orchestration', 4, 'feature'),
  ('Claude Desktop MCP', 3, 'feature'),
  ('Claude Code MCP server', 3, 'feature')
ON CONFLICT (keyword) DO NOTHING;

-- RLS
ALTER TABLE serp_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE serp_keywords ENABLE ROW LEVEL SECURITY;

-- Admin-only policies (service role bypasses RLS)
CREATE POLICY serp_tracking_admin ON serp_tracking FOR ALL USING (false);
CREATE POLICY serp_keywords_admin ON serp_keywords FOR ALL USING (false);
