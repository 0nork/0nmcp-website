-- Reddit Growth Engine — Learning Loop
-- Tracks opportunities found, content drafted, posts made, and engagement scores
-- Self-adjusting weights based on what works

-- Opportunities found by the scanner
CREATE TABLE IF NOT EXISTS reddit_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reddit_post_id TEXT NOT NULL UNIQUE,
  subreddit TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  author TEXT,
  score INTEGER DEFAULT 0,
  num_comments INTEGER DEFAULT 0,
  permalink TEXT,
  keywords_matched TEXT[] DEFAULT '{}',
  opportunity_type TEXT NOT NULL DEFAULT 'comment',
  priority_score NUMERIC(5,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'found',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Content generated for Reddit (posts + comments)
CREATE TABLE IF NOT EXISTS reddit_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID REFERENCES reddit_opportunities(id) ON DELETE SET NULL,
  content_type TEXT NOT NULL DEFAULT 'comment',
  subreddit TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  persona TEXT,
  tone TEXT,
  word_count INTEGER DEFAULT 0,
  includes_link BOOLEAN DEFAULT false,
  link_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  reddit_post_id TEXT,
  reddit_post_url TEXT,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Engagement tracking — scores checked periodically
CREATE TABLE IF NOT EXISTS reddit_engagement (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES reddit_content(id) ON DELETE CASCADE,
  reddit_thing_id TEXT NOT NULL,
  check_number INTEGER DEFAULT 1,
  score INTEGER DEFAULT 0,
  num_replies INTEGER DEFAULT 0,
  upvote_ratio NUMERIC(3,2),
  is_removed BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ DEFAULT now()
);

-- Learning weights — what subreddits, tones, content types, lengths perform best
CREATE TABLE IF NOT EXISTS reddit_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension TEXT NOT NULL,
  key TEXT NOT NULL,
  weight NUMERIC(5,4) NOT NULL DEFAULT 1.0,
  total_posts INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  avg_score NUMERIC(6,2) DEFAULT 0,
  last_adjusted TIMESTAMPTZ DEFAULT now(),
  UNIQUE(dimension, key)
);

-- Seed initial weights
INSERT INTO reddit_weights (dimension, key, weight) VALUES
  -- Subreddit weights (how well each performs)
  ('subreddit', 'ClaudeAI', 1.0),
  ('subreddit', 'LocalLLaMA', 1.0),
  ('subreddit', 'artificial', 1.0),
  ('subreddit', 'SaaS', 1.0),
  ('subreddit', 'selfhosted', 1.0),
  ('subreddit', 'webdev', 1.0),
  ('subreddit', 'node', 1.0),
  ('subreddit', 'programming', 1.0),
  ('subreddit', 'automation', 1.0),
  ('subreddit', 'MCP', 1.0),
  ('subreddit', 'nocode', 1.0),
  ('subreddit', 'Entrepreneur', 1.0),
  ('subreddit', 'startups', 1.0),
  ('subreddit', 'devops', 1.0),
  -- Content type weights
  ('content_type', 'comment', 1.0),
  ('content_type', 'post_tutorial', 1.0),
  ('content_type', 'post_showoff', 1.0),
  ('content_type', 'post_comparison', 1.0),
  ('content_type', 'post_question', 1.0),
  ('content_type', 'post_story', 1.0),
  -- Tone weights
  ('tone', 'casual', 1.0),
  ('tone', 'technical', 1.0),
  ('tone', 'helpful', 1.0),
  ('tone', 'enthusiastic', 1.0),
  ('tone', 'dry_humor', 1.0),
  -- Length bucket weights
  ('length', 'short_50_150', 1.0),
  ('length', 'medium_150_400', 1.0),
  ('length', 'long_400_800', 1.0),
  ('length', 'very_long_800_plus', 1.0),
  -- Time of day weights (UTC hours)
  ('hour', '6', 1.0),
  ('hour', '9', 1.0),
  ('hour', '12', 1.0),
  ('hour', '14', 1.0),
  ('hour', '17', 1.0),
  ('hour', '20', 1.0)
ON CONFLICT (dimension, key) DO NOTHING;

-- Aggregate view for performance dashboard
CREATE OR REPLACE VIEW reddit_performance AS
SELECT
  rc.subreddit,
  rc.content_type,
  rc.tone,
  rc.status,
  count(*) AS total_posts,
  avg(re.score) AS avg_score,
  sum(re.num_replies) AS total_replies,
  avg(rc.word_count) AS avg_word_count,
  count(*) FILTER (WHERE re.score > 5) AS high_performers,
  count(*) FILTER (WHERE re.is_removed) AS removed,
  max(rc.posted_at) AS last_posted
FROM reddit_content rc
LEFT JOIN LATERAL (
  SELECT score, num_replies, is_removed
  FROM reddit_engagement
  WHERE content_id = rc.id
  ORDER BY check_number DESC
  LIMIT 1
) re ON true
WHERE rc.status = 'posted'
GROUP BY rc.subreddit, rc.content_type, rc.tone, rc.status;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_reddit_opp_status ON reddit_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_reddit_opp_subreddit ON reddit_opportunities(subreddit);
CREATE INDEX IF NOT EXISTS idx_reddit_content_status ON reddit_content(status);
CREATE INDEX IF NOT EXISTS idx_reddit_content_posted ON reddit_content(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_reddit_engagement_content ON reddit_engagement(content_id);

-- RLS
ALTER TABLE reddit_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_engagement ENABLE ROW LEVEL SECURITY;
ALTER TABLE reddit_weights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access" ON reddit_opportunities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reddit_content FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reddit_engagement FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reddit_weights FOR ALL USING (true) WITH CHECK (true);
