-- Blog Engine: extend blog_posts for full UI + add subscribers
-- Existing table from 20260225100000_blog_cro9.sql has: id, title, slug, content,
-- meta_description, target_query, bucket, word_count, status, published_at, created_at, updated_at

ALTER TABLE blog_posts
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'news',
  ADD COLUMN IF NOT EXISTS author TEXT DEFAULT 'Mike Mento',
  ADD COLUMN IF NOT EXISTS author_title TEXT DEFAULT 'Founder, RocketOpp LLC',
  ADD COLUMN IF NOT EXISTS image TEXT,
  ADD COLUMN IF NOT EXISTS excerpt TEXT,
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS body TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_post_id TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_posted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_blog_posts_source ON blog_posts(source);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(status, published_at DESC);

-- Blog subscribers
CREATE TABLE IF NOT EXISTS blog_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  confirmed BOOLEAN DEFAULT false,
  confirmation_token UUID DEFAULT gen_random_uuid(),
  subscribed_at TIMESTAMPTZ DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ,
  source TEXT DEFAULT 'website'
);

CREATE INDEX IF NOT EXISTS idx_blog_subscribers_email ON blog_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_blog_subscribers_confirmed ON blog_subscribers(confirmed);

ALTER TABLE blog_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can subscribe" ON blog_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access on subscribers" ON blog_subscribers
  FOR ALL USING (true);
