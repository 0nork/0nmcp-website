-- =============================================================================
-- RECONCILE PRODUCTION: yaehbwimocvvnnlojkxe
-- =============================================================================
-- Date: 2026-02-27
-- Purpose: Bring production Supabase database in sync with the full 0nmcp.com
--          codebase expectations. Idempotent — safe to run multiple times.
--
-- What this migration does:
--   1. Adds missing columns to profiles table
--   2. Creates community_threads + community_posts (the core forum tables)
--   3. Creates community_groups, memberships, votes, badges, user_badges
--   4. Creates persona tables (community_personas, topic_seeds, conversations)
--   5. Creates marketplace tables (installations, triggers, executions)
--   6. Creates QA engine tables (qa_content, qa_distributions, qa_platforms)
--   7. Creates SEO/blog tables (blog_posts, seo_runs, seo_weights, seo_pages, seo_actions)
--   8. Creates all functions, triggers, indexes, and RLS policies
--   9. Seeds default data (groups, badges, platforms, weights)
--  10. Fixes existing user data (mike@rocketopp.com onboarding)
--
-- Safety:
--   - All CREATE TABLE use IF NOT EXISTS
--   - All ALTER TABLE use ADD COLUMN IF NOT EXISTS
--   - All CREATE INDEX use IF NOT EXISTS
--   - All functions use CREATE OR REPLACE
--   - All triggers use DROP IF EXISTS before CREATE
--   - All policies use DO $$ IF NOT EXISTS pattern
--   - All seed INSERTs use ON CONFLICT DO NOTHING
-- =============================================================================


-- =============================================================================
-- 1. PROFILES — Add missing columns
-- =============================================================================

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS karma INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reputation_level TEXT DEFAULT 'newcomer',
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS onboarding_step INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS sponsor_tier TEXT,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS is_persona BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS crm_community_contact_id TEXT;

-- Add check constraint on reputation_level if not already present
-- (wrapped in DO block because ADD CONSTRAINT IF NOT EXISTS is not standard)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_reputation_level_check'
  ) THEN
    BEGIN
      ALTER TABLE profiles ADD CONSTRAINT profiles_reputation_level_check
        CHECK (reputation_level IN ('newcomer', 'member', 'contributor', 'power_user', 'expert', 'legend'));
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- Set defaults for existing users who might have NULLs
UPDATE profiles SET onboarding_completed = true WHERE onboarding_completed IS NULL;
UPDATE profiles SET onboarding_step = 5 WHERE onboarding_step IS NULL;
UPDATE profiles SET karma = 0 WHERE karma IS NULL;
UPDATE profiles SET reputation_level = 'newcomer' WHERE reputation_level IS NULL;
UPDATE profiles SET is_persona = false WHERE is_persona IS NULL;
UPDATE profiles SET interests = '{}' WHERE interests IS NULL;


-- =============================================================================
-- 2. COMMUNITY_THREADS — Core forum table
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  group_id UUID,  -- FK added after community_groups exists
  score INT DEFAULT 0,
  hot_score FLOAT DEFAULT 0,
  view_count INT DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  reply_count INT DEFAULT 0,
  last_reply_at TIMESTAMPTZ,
  source TEXT DEFAULT 'forum' CHECK (source IN ('forum', 'crm_sync', 'persona')),
  external_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns that may be missing if table already existed
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS group_id UUID,
  ADD COLUMN IF NOT EXISTS score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS view_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS reply_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_reply_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'forum',
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Add source CHECK constraint if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'community_threads_source_check'
  ) THEN
    BEGIN
      ALTER TABLE community_threads ADD CONSTRAINT community_threads_source_check
        CHECK (source IN ('forum', 'crm_sync', 'persona'));
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;


-- =============================================================================
-- 3. COMMUNITY_POSTS — Replies
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES community_threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  score INT DEFAULT 0,
  is_solution BOOLEAN DEFAULT false,
  parent_post_id UUID,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add columns that may be missing if table already existed
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_solution BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS parent_post_id UUID;


-- =============================================================================
-- 4. COMMUNITY_GROUPS — Forum groups/subreddits
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT DEFAULT '#00ff88',
  rules TEXT,
  is_default BOOLEAN DEFAULT false,
  is_official BOOLEAN DEFAULT false,
  member_count INT DEFAULT 0,
  thread_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Now add FK from community_threads.group_id -> community_groups.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'community_threads_group_id_fkey'
  ) THEN
    ALTER TABLE community_threads
      ADD CONSTRAINT community_threads_group_id_fkey
      FOREIGN KEY (group_id) REFERENCES community_groups(id);
  END IF;
END $$;

-- Seed default groups (10 groups)
INSERT INTO community_groups (name, slug, description, icon, color, is_default, is_official) VALUES
  ('General',           'general',          'General discussion about 0nMCP and AI orchestration',         '💬', '#00ff88', true,  true),
  ('Help & Support',    'help',             'Ask questions and get help from the community',                '🆘', '#ff6b35', true,  true),
  ('Showcase',          'showcase',         'Show off what you''ve built with 0nMCP',                       '🚀', '#9945ff', true,  true),
  ('Feature Requests',  'feature-requests', 'Suggest and vote on new features',                            '💡', '#00d4ff', true,  true),
  ('Bug Reports',       'bug-reports',      'Report bugs and track fixes',                                  '🐛', '#ff3d3d', true,  true),
  ('Tutorials',         'tutorials',        'Share tutorials, guides, and walkthroughs',                    '📚', '#FFD700', true,  true),
  ('Workflows',         'workflows',        'Share and discuss .0n workflow files and RUNs',                 '⚡', '#ff69b4', true,  true),
  ('Integrations',      'integrations',     'Discuss service integrations and API connections',              '🔗', '#20b2aa', true,  true),
  ('Off Topic',         'off-topic',        'Anything goes (within reason)',                                 '🎲', '#888888', true,  true),
  ('ROCKET Community',  'rocket-community', 'Posts from the ROCKET community portal',                       '🚀', '#ff6b35', false, true)
ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- 5. COMMUNITY_MEMBERSHIPS
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, group_id)
);


-- =============================================================================
-- 6. COMMUNITY_VOTES
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES community_threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, post_id),
  CHECK (
    (thread_id IS NOT NULL AND post_id IS NULL) OR
    (thread_id IS NULL AND post_id IS NOT NULL)
  )
);


-- =============================================================================
-- 7. COMMUNITY_BADGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  criteria JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed badges
INSERT INTO community_badges (name, slug, description, icon, color, tier, criteria) VALUES
  ('First Post',       'first-post',       'Created your first thread',            '✏️', '#00ff88', 'bronze',   '{"type":"threads","threshold":1}'),
  ('Helpful',          'helpful',          'Received 10 helpful reactions',         '💡', '#FFD700', 'bronze',   '{"type":"helpful_received","threshold":10}'),
  ('Contributor',      'contributor',      'Created 10 threads',                    '📝', '#00d4ff', 'silver',   '{"type":"threads","threshold":10}'),
  ('Problem Solver',   'problem-solver',   'Had 5 replies marked as solution',      '🎯', '#9945ff', 'silver',   '{"type":"solutions","threshold":5}'),
  ('Community Star',   'community-star',   'Reached 100 karma',                     '⭐', '#FFD700', 'gold',     '{"type":"karma","threshold":100}'),
  ('Power User',       'power-user',       'Reached 500 karma',                     '🔥', '#ff6b35', 'gold',     '{"type":"karma","threshold":500}'),
  ('Legend',           'legend',           'Reached 1000 karma',                    '👑', '#ff69b4', 'platinum', '{"type":"karma","threshold":1000}'),
  ('Certified Expert', 'certified-expert', 'Completed 0nMCP certification course',  '🏆', '#00ff88', 'diamond',  '{"type":"certification","course":"0nmcp-expert"}')
ON CONFLICT (slug) DO NOTHING;


-- =============================================================================
-- 8. COMMUNITY_USER_BADGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES community_badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- The codebase references "earned_at" but original migration used "awarded_at".
-- Add earned_at if missing (code queries on earned_at).
ALTER TABLE community_user_badges
  ADD COLUMN IF NOT EXISTS earned_at TIMESTAMPTZ DEFAULT now();

-- Backfill earned_at from awarded_at where earned_at is null
UPDATE community_user_badges SET earned_at = awarded_at WHERE earned_at IS NULL AND awarded_at IS NOT NULL;


-- =============================================================================
-- 9. COMMUNITY_PERSONAS — AI Forum Agents
-- =============================================================================

CREATE TABLE IF NOT EXISTS community_personas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role TEXT,
  expertise TEXT[],
  personality JSONB,
  knowledge_level TEXT DEFAULT 'intermediate' CHECK (knowledge_level IN ('beginner', 'intermediate', 'expert')),
  preferred_groups TEXT[],
  is_active BOOLEAN DEFAULT true,
  activity_level TEXT DEFAULT 'moderate' CHECK (activity_level IN ('low', 'moderate', 'high')),
  last_active_at TIMESTAMPTZ,
  thread_count INT DEFAULT 0,
  reply_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 10. PERSONA_TOPIC_SEEDS
-- =============================================================================

CREATE TABLE IF NOT EXISTS persona_topic_seeds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  category TEXT,
  prompt_hint TEXT,
  priority INT DEFAULT 5,
  used_count INT DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 11. PERSONA_CONVERSATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS persona_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES community_threads(id),
  persona_id UUID REFERENCES community_personas(id),
  action TEXT,
  content_preview TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 12. MARKETPLACE_INSTALLATIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS marketplace_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL UNIQUE,
  company_id TEXT,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expires_at TIMESTAMPTZ,
  scopes TEXT[],
  user_type TEXT DEFAULT 'Location',
  installed_by TEXT,
  app_config JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  installed_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 13. MARKETPLACE_TRIGGERS
-- =============================================================================

CREATE TABLE IF NOT EXISTS marketplace_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_id TEXT NOT NULL UNIQUE,
  trigger_key TEXT NOT NULL,
  location_id TEXT NOT NULL,
  workflow_id TEXT NOT NULL,
  company_id TEXT,
  target_url TEXT NOT NULL,
  filters JSONB DEFAULT '[]',
  event_type TEXT DEFAULT 'CREATED',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 14. MARKETPLACE_EXECUTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS marketplace_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL,
  action_key TEXT NOT NULL,
  contact_id TEXT,
  workflow_id TEXT,
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  duration_ms INTEGER,
  error_message TEXT,
  executed_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 15. QA_CONTENT
-- =============================================================================

CREATE TABLE IF NOT EXISTS qa_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic TEXT NOT NULL,
  keywords TEXT[] DEFAULT '{}',
  platform TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  quality_score NUMERIC(3,2),
  reading_level TEXT,
  backlinks TEXT[] DEFAULT '{}',
  variant_index INT DEFAULT 0,
  batch_id TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 16. QA_DISTRIBUTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS qa_distributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID REFERENCES qa_content(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_url TEXT,
  status TEXT DEFAULT 'pending',
  response JSONB,
  distributed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 17. QA_PLATFORMS
-- =============================================================================

CREATE TABLE IF NOT EXISTS qa_platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  domain_authority INT,
  max_daily_posts INT DEFAULT 5,
  enabled BOOLEAN DEFAULT true,
  config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed platforms
INSERT INTO qa_platforms (id, name, domain, domain_authority, max_daily_posts, enabled, config) VALUES
  ('quora',          'Quora',          'quora.com',             93, 3,  true,  '{"format":"markdown","linkPolicy":"moderate"}'),
  ('reddit',         'Reddit',         'reddit.com',            99, 5,  true,  '{"format":"markdown","linkPolicy":"strict"}'),
  ('poe',            'Poe (Quora AI)', 'poe.com',               75, 10, true,  '{"format":"markdown","linkPolicy":"none"}'),
  ('warrior_forum',  'Warrior Forum',  'warriorforum.com',      72, 2,  true,  '{"format":"bbcode","linkPolicy":"generous"}'),
  ('indiehackers',   'Indie Hackers',  'indiehackers.com',      78, 3,  true,  '{"format":"markdown","linkPolicy":"moderate"}'),
  ('growthhackers',  'GrowthHackers',  'growthhackers.com',     68, 3,  true,  '{"format":"markdown","linkPolicy":"moderate"}'),
  ('medium',         'Medium',         'medium.com',            96, 2,  true,  '{"format":"html","linkPolicy":"generous"}'),
  ('hackernews',     'Hacker News',    'news.ycombinator.com',  92, 2,  true,  '{"format":"plain","linkPolicy":"strict"}'),
  ('producthunt',    'Product Hunt',   'producthunt.com',       90, 1,  true,  '{"format":"markdown","linkPolicy":"generous"}'),
  ('dev_to',         'Dev.to',         'dev.to',                85, 3,  true,  '{"format":"markdown","linkPolicy":"generous"}'),
  ('hashnode',       'Hashnode',       'hashnode.com',           82, 3,  true,  '{"format":"markdown","linkPolicy":"generous"}'),
  ('linkedin',       'LinkedIn',       'linkedin.com',          98, 5,  true,  '{"format":"plain","linkPolicy":"moderate"}')
ON CONFLICT (id) DO NOTHING;


-- =============================================================================
-- 18. BLOG_POSTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  meta_description TEXT,
  target_query TEXT,
  bucket TEXT,
  word_count INT,
  status TEXT DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 19. SEO_WEIGHTS
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  impressions NUMERIC(5,4) DEFAULT 0.25,
  position NUMERIC(5,4) DEFAULT 0.25,
  ctr_gap NUMERIC(5,4) DEFAULT 0.25,
  conversions NUMERIC(5,4) DEFAULT 0.15,
  freshness NUMERIC(5,4) DEFAULT 0.10,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default weights
INSERT INTO seo_weights (impressions, position, ctr_gap, conversions, freshness, active)
SELECT 0.25, 0.25, 0.25, 0.15, 0.10, true
WHERE NOT EXISTS (SELECT 1 FROM seo_weights LIMIT 1);


-- =============================================================================
-- 20. SEO_RUNS
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pages_analyzed INT DEFAULT 0,
  actions_generated INT DEFAULT 0,
  weight_id UUID REFERENCES seo_weights(id),
  status TEXT DEFAULT 'running',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 21. SEO_PAGES
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  query TEXT NOT NULL,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  ctr NUMERIC(5,4) DEFAULT 0,
  position NUMERIC(5,2) DEFAULT 0,
  score NUMERIC(5,3),
  bucket TEXT,
  factors JSONB,
  run_id UUID REFERENCES seo_runs(id),
  created_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 22. SEO_ACTIONS
-- =============================================================================

CREATE TABLE IF NOT EXISTS seo_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID REFERENCES seo_pages(id),
  bucket TEXT NOT NULL,
  brief JSONB,
  status TEXT DEFAULT 'pending',
  outcome JSONB,
  evaluated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- =============================================================================
-- 23. FUNCTIONS
-- =============================================================================

-- Hot score calculator (Reddit algorithm)
CREATE OR REPLACE FUNCTION calculate_hot_score(p_score INT, p_created_at TIMESTAMPTZ)
RETURNS FLOAT AS $$
DECLARE
  order_val FLOAT;
  sign_val INT;
  seconds FLOAT;
BEGIN
  order_val := log(greatest(abs(p_score), 1));
  IF p_score > 0 THEN sign_val := 1;
  ELSIF p_score < 0 THEN sign_val := -1;
  ELSE sign_val := 0;
  END IF;
  seconds := extract(epoch FROM p_created_at) - 1704067200; -- epoch since 2024-01-01
  RETURN round((order_val + sign_val * seconds / 45000)::numeric, 7);
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- Update thread score and hot_score when votes change
CREATE OR REPLACE FUNCTION update_thread_score()
RETURNS TRIGGER AS $$
DECLARE
  new_score INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT COALESCE(SUM(vote), 0) INTO new_score
    FROM community_votes WHERE thread_id = OLD.thread_id;
    UPDATE community_threads
    SET score = new_score,
        hot_score = calculate_hot_score(new_score, created_at)
    WHERE id = OLD.thread_id;
  ELSE
    SELECT COALESCE(SUM(vote), 0) INTO new_score
    FROM community_votes WHERE thread_id = NEW.thread_id;
    UPDATE community_threads
    SET score = new_score,
        hot_score = calculate_hot_score(new_score, created_at)
    WHERE id = NEW.thread_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- Update post score when votes change
CREATE OR REPLACE FUNCTION update_post_score()
RETURNS TRIGGER AS $$
DECLARE
  new_score INT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT COALESCE(SUM(vote), 0) INTO new_score
    FROM community_votes WHERE post_id = OLD.post_id;
    UPDATE community_posts SET score = new_score WHERE id = OLD.post_id;
  ELSE
    SELECT COALESCE(SUM(vote), 0) INTO new_score
    FROM community_votes WHERE post_id = NEW.post_id;
    UPDATE community_posts SET score = new_score WHERE id = NEW.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- Update user karma when their content gets voted on
CREATE OR REPLACE FUNCTION update_user_karma()
RETURNS TRIGGER AS $$
DECLARE
  target_user_id UUID;
  total_karma INT;
BEGIN
  -- Find the author of the voted content
  IF NEW.thread_id IS NOT NULL THEN
    SELECT user_id INTO target_user_id FROM community_threads WHERE id = NEW.thread_id;
  ELSIF NEW.post_id IS NOT NULL THEN
    SELECT user_id INTO target_user_id FROM community_posts WHERE id = NEW.post_id;
  END IF;

  IF target_user_id IS NULL THEN RETURN NEW; END IF;

  -- Recalculate total karma
  SELECT COALESCE(SUM(v.vote), 0) INTO total_karma
  FROM community_votes v
  LEFT JOIN community_threads t ON v.thread_id = t.id
  LEFT JOIN community_posts p ON v.post_id = p.id
  WHERE COALESCE(t.user_id, p.user_id) = target_user_id;

  -- Update karma and reputation level
  UPDATE profiles SET
    karma = total_karma,
    reputation_level = CASE
      WHEN total_karma >= 1000 THEN 'legend'
      WHEN total_karma >= 500  THEN 'expert'
      WHEN total_karma >= 100  THEN 'power_user'
      WHEN total_karma >= 25   THEN 'contributor'
      WHEN total_karma >= 5    THEN 'member'
      ELSE 'newcomer'
    END
  WHERE id = target_user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Update group thread count
CREATE OR REPLACE FUNCTION update_group_thread_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.group_id IS NOT NULL THEN
    UPDATE community_groups SET thread_count = thread_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' AND OLD.group_id IS NOT NULL THEN
    UPDATE community_groups SET thread_count = thread_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- Update group member count
CREATE OR REPLACE FUNCTION update_group_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE community_groups SET member_count = member_count + 1 WHERE id = NEW.group_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE community_groups SET member_count = member_count - 1 WHERE id = OLD.group_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;


-- Increment view count for threads (called via supabase.rpc)
CREATE OR REPLACE FUNCTION increment_view_count(thread_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE community_threads
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = thread_id;
END;
$$ LANGUAGE plpgsql;


-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, company, onboarding_completed, onboarding_step)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    false,
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;


-- Updated_at trigger for qa_content
CREATE OR REPLACE FUNCTION update_qa_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- =============================================================================
-- 24. TRIGGERS
-- =============================================================================

-- Thread vote score triggers
DROP TRIGGER IF EXISTS trg_thread_vote_score ON community_votes;
DROP TRIGGER IF EXISTS trg_thread_vote_score_insert ON community_votes;
DROP TRIGGER IF EXISTS trg_thread_vote_score_delete ON community_votes;

CREATE TRIGGER trg_thread_vote_score_insert
  AFTER INSERT OR UPDATE ON community_votes
  FOR EACH ROW
  WHEN (NEW.thread_id IS NOT NULL)
  EXECUTE FUNCTION update_thread_score();

CREATE TRIGGER trg_thread_vote_score_delete
  AFTER DELETE ON community_votes
  FOR EACH ROW
  WHEN (OLD.thread_id IS NOT NULL)
  EXECUTE FUNCTION update_thread_score();

-- Post vote score triggers
DROP TRIGGER IF EXISTS trg_post_vote_score ON community_votes;
DROP TRIGGER IF EXISTS trg_post_vote_score_insert ON community_votes;
DROP TRIGGER IF EXISTS trg_post_vote_score_delete ON community_votes;

CREATE TRIGGER trg_post_vote_score_insert
  AFTER INSERT OR UPDATE ON community_votes
  FOR EACH ROW
  WHEN (NEW.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_score();

CREATE TRIGGER trg_post_vote_score_delete
  AFTER DELETE ON community_votes
  FOR EACH ROW
  WHEN (OLD.post_id IS NOT NULL)
  EXECUTE FUNCTION update_post_score();

-- Karma trigger
DROP TRIGGER IF EXISTS trg_update_karma ON community_votes;
CREATE TRIGGER trg_update_karma
  AFTER INSERT OR UPDATE ON community_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_karma();

-- Group thread count trigger
DROP TRIGGER IF EXISTS trg_group_thread_count ON community_threads;
CREATE TRIGGER trg_group_thread_count
  AFTER INSERT OR DELETE ON community_threads
  FOR EACH ROW
  EXECUTE FUNCTION update_group_thread_count();

-- Group member count trigger
DROP TRIGGER IF EXISTS trg_group_member_count ON community_memberships;
CREATE TRIGGER trg_group_member_count
  AFTER INSERT OR DELETE ON community_memberships
  FOR EACH ROW
  EXECUTE FUNCTION update_group_member_count();

-- Auth user created trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- QA content updated_at trigger
DROP TRIGGER IF EXISTS qa_content_updated_at ON qa_content;
CREATE TRIGGER qa_content_updated_at
  BEFORE UPDATE ON qa_content
  FOR EACH ROW
  EXECUTE FUNCTION update_qa_content_updated_at();


-- =============================================================================
-- 25. INDEXES
-- =============================================================================

-- community_threads
CREATE INDEX IF NOT EXISTS idx_threads_user ON community_threads(user_id);
CREATE INDEX IF NOT EXISTS idx_threads_group ON community_threads(group_id);
CREATE INDEX IF NOT EXISTS idx_threads_score ON community_threads(score DESC);
CREATE INDEX IF NOT EXISTS idx_threads_hot ON community_threads(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_threads_slug ON community_threads(slug);
CREATE INDEX IF NOT EXISTS idx_threads_created ON community_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_last_reply ON community_threads(last_reply_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_threads_category ON community_threads(category);

-- community_posts
CREATE INDEX IF NOT EXISTS idx_posts_thread ON community_posts(thread_id);
CREATE INDEX IF NOT EXISTS idx_posts_user ON community_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created ON community_posts(created_at);

-- community_votes
CREATE INDEX IF NOT EXISTS idx_votes_thread ON community_votes(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_post ON community_votes(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_user ON community_votes(user_id);

-- community_memberships
CREATE INDEX IF NOT EXISTS idx_memberships_user ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_group ON community_memberships(group_id);

-- community_user_badges
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON community_user_badges(user_id);

-- community_personas
CREATE INDEX IF NOT EXISTS idx_personas_active ON community_personas(is_active) WHERE is_active = true;

-- persona_conversations
CREATE INDEX IF NOT EXISTS idx_persona_convos_thread ON persona_conversations(thread_id);

-- persona_topic_seeds
CREATE INDEX IF NOT EXISTS idx_topic_seeds_priority ON persona_topic_seeds(priority DESC, used_count ASC);

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed) WHERE onboarding_completed = true;
CREATE INDEX IF NOT EXISTS idx_profiles_is_persona ON profiles(is_persona) WHERE is_persona = true;
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username) WHERE username IS NOT NULL;

-- marketplace
CREATE INDEX IF NOT EXISTS idx_installations_location ON marketplace_installations(location_id);
CREATE INDEX IF NOT EXISTS idx_triggers_location ON marketplace_triggers(location_id);
CREATE INDEX IF NOT EXISTS idx_triggers_key ON marketplace_triggers(trigger_key);
CREATE INDEX IF NOT EXISTS idx_executions_location ON marketplace_executions(location_id);
CREATE INDEX IF NOT EXISTS idx_executions_action ON marketplace_executions(action_key);
CREATE INDEX IF NOT EXISTS idx_executions_date ON marketplace_executions(executed_at DESC);

-- qa engine
CREATE INDEX IF NOT EXISTS idx_qa_content_topic ON qa_content(topic);
CREATE INDEX IF NOT EXISTS idx_qa_content_platform ON qa_content(platform);
CREATE INDEX IF NOT EXISTS idx_qa_content_status ON qa_content(status);
CREATE INDEX IF NOT EXISTS idx_qa_content_batch ON qa_content(batch_id);
CREATE INDEX IF NOT EXISTS idx_qa_content_created ON qa_content(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qa_distributions_content ON qa_distributions(content_id);
CREATE INDEX IF NOT EXISTS idx_qa_distributions_platform ON qa_distributions(platform);
CREATE INDEX IF NOT EXISTS idx_qa_distributions_status ON qa_distributions(status);
CREATE INDEX IF NOT EXISTS idx_qa_distributions_created ON qa_distributions(created_at DESC);

-- blog / seo
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_seo_pages_run ON seo_pages(run_id);
CREATE INDEX IF NOT EXISTS idx_seo_pages_bucket ON seo_pages(bucket);
CREATE INDEX IF NOT EXISTS idx_seo_actions_page ON seo_actions(page_id);


-- =============================================================================
-- 26. ROW LEVEL SECURITY — Enable + Policies
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE community_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_personas ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_topic_seeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE persona_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_platforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- All RLS policies wrapped in DO blocks for idempotency
DO $$
BEGIN

  -- ======================== PROFILES ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_own_read') THEN
    CREATE POLICY profiles_own_read ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_own_update') THEN
    CREATE POLICY profiles_own_update ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_service_insert') THEN
    CREATE POLICY profiles_service_insert ON profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_public_read') THEN
    CREATE POLICY profiles_public_read ON profiles FOR SELECT USING (true);
  END IF;

  -- ======================== COMMUNITY_THREADS ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_threads' AND policyname = 'threads_public_read') THEN
    CREATE POLICY threads_public_read ON community_threads FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_threads' AND policyname = 'threads_auth_insert') THEN
    CREATE POLICY threads_auth_insert ON community_threads FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_threads' AND policyname = 'threads_auth_update') THEN
    CREATE POLICY threads_auth_update ON community_threads FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_threads' AND policyname = 'threads_auth_delete') THEN
    CREATE POLICY threads_auth_delete ON community_threads FOR DELETE USING (auth.uid() = user_id);
  END IF;
  -- Service role needs full access for persona engine
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_threads' AND policyname = 'threads_service_all') THEN
    CREATE POLICY threads_service_all ON community_threads FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- ======================== COMMUNITY_POSTS ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'posts_public_read') THEN
    CREATE POLICY posts_public_read ON community_posts FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'posts_auth_insert') THEN
    CREATE POLICY posts_auth_insert ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'posts_auth_update') THEN
    CREATE POLICY posts_auth_update ON community_posts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  -- Service role needs full access for persona engine
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_posts' AND policyname = 'posts_service_all') THEN
    CREATE POLICY posts_service_all ON community_posts FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- ======================== COMMUNITY_GROUPS ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_groups' AND policyname = 'groups_public_read') THEN
    CREATE POLICY groups_public_read ON community_groups FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_groups' AND policyname = 'groups_auth_insert') THEN
    CREATE POLICY groups_auth_insert ON community_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
  END IF;

  -- ======================== COMMUNITY_MEMBERSHIPS ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_memberships' AND policyname = 'memberships_own_read') THEN
    CREATE POLICY memberships_own_read ON community_memberships FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_memberships' AND policyname = 'memberships_own_insert') THEN
    CREATE POLICY memberships_own_insert ON community_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_memberships' AND policyname = 'memberships_own_delete') THEN
    CREATE POLICY memberships_own_delete ON community_memberships FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- ======================== COMMUNITY_VOTES ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'votes_public_read') THEN
    CREATE POLICY votes_public_read ON community_votes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'votes_own_insert') THEN
    CREATE POLICY votes_own_insert ON community_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'votes_own_update') THEN
    CREATE POLICY votes_own_update ON community_votes FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_votes' AND policyname = 'votes_own_delete') THEN
    CREATE POLICY votes_own_delete ON community_votes FOR DELETE USING (auth.uid() = user_id);
  END IF;

  -- ======================== COMMUNITY_BADGES ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_badges' AND policyname = 'badges_public_read') THEN
    CREATE POLICY badges_public_read ON community_badges FOR SELECT USING (true);
  END IF;

  -- ======================== COMMUNITY_USER_BADGES ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_user_badges' AND policyname = 'user_badges_public_read') THEN
    CREATE POLICY user_badges_public_read ON community_user_badges FOR SELECT USING (true);
  END IF;

  -- ======================== COMMUNITY_PERSONAS ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_personas' AND policyname = 'Public can view active personas') THEN
    CREATE POLICY "Public can view active personas" ON community_personas FOR SELECT USING (is_active = true);
  END IF;
  -- Service role full access for persona engine
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_personas' AND policyname = 'personas_service_all') THEN
    CREATE POLICY personas_service_all ON community_personas FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- ======================== PERSONA_TOPIC_SEEDS ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'persona_topic_seeds' AND policyname = 'Service role manages topic seeds') THEN
    CREATE POLICY "Service role manages topic seeds" ON persona_topic_seeds FOR ALL USING (true);
  END IF;

  -- ======================== PERSONA_CONVERSATIONS ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'persona_conversations' AND policyname = 'Public can view persona conversations') THEN
    CREATE POLICY "Public can view persona conversations" ON persona_conversations FOR SELECT USING (true);
  END IF;
  -- Service role write access
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'persona_conversations' AND policyname = 'persona_conversations_service_all') THEN
    CREATE POLICY persona_conversations_service_all ON persona_conversations FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- ======================== MARKETPLACE ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_installations' AND policyname = 'Service role full access on installations') THEN
    CREATE POLICY "Service role full access on installations" ON marketplace_installations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_triggers' AND policyname = 'Service role full access on triggers') THEN
    CREATE POLICY "Service role full access on triggers" ON marketplace_triggers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'marketplace_executions' AND policyname = 'Service role full access on executions') THEN
    CREATE POLICY "Service role full access on executions" ON marketplace_executions FOR ALL USING (true) WITH CHECK (true);
  END IF;

  -- ======================== QA ENGINE ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qa_content' AND policyname = 'Admin full access on qa_content') THEN
    CREATE POLICY "Admin full access on qa_content" ON qa_content FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qa_distributions' AND policyname = 'Admin full access on qa_distributions') THEN
    CREATE POLICY "Admin full access on qa_distributions" ON qa_distributions FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'qa_platforms' AND policyname = 'Admin full access on qa_platforms') THEN
    CREATE POLICY "Admin full access on qa_platforms" ON qa_platforms FOR ALL USING (true);
  END IF;

  -- ======================== BLOG / SEO ========================
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'blog_posts' AND policyname = 'Admin full access on blog_posts') THEN
    CREATE POLICY "Admin full access on blog_posts" ON blog_posts FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_pages' AND policyname = 'Admin full access on seo_pages') THEN
    CREATE POLICY "Admin full access on seo_pages" ON seo_pages FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_actions' AND policyname = 'Admin full access on seo_actions') THEN
    CREATE POLICY "Admin full access on seo_actions" ON seo_actions FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_weights' AND policyname = 'Admin full access on seo_weights') THEN
    CREATE POLICY "Admin full access on seo_weights" ON seo_weights FOR ALL USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'seo_runs' AND policyname = 'Admin full access on seo_runs') THEN
    CREATE POLICY "Admin full access on seo_runs" ON seo_runs FOR ALL USING (true);
  END IF;

END $$;


-- =============================================================================
-- 27. USER_WORKFLOWS — Converter table
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source_platform TEXT DEFAULT 'unknown',
  source_format TEXT,
  workflow JSONB NOT NULL DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add missing columns to existing table
ALTER TABLE user_workflows
  ADD COLUMN IF NOT EXISTS source_platform TEXT DEFAULT 'unknown',
  ADD COLUMN IF NOT EXISTS source_format TEXT,
  ADD COLUMN IF NOT EXISTS stats JSONB DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_user_workflows_user ON user_workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_user_workflows_platform ON user_workflows(source_platform);

ALTER TABLE user_workflows ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_workflows' AND policyname = 'Users can view own workflows') THEN
    CREATE POLICY "Users can view own workflows" ON user_workflows FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_workflows' AND policyname = 'Users can insert own workflows') THEN
    CREATE POLICY "Users can insert own workflows" ON user_workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_workflows' AND policyname = 'Users can update own workflows') THEN
    CREATE POLICY "Users can update own workflows" ON user_workflows FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_workflows' AND policyname = 'Users can delete own workflows') THEN
    CREATE POLICY "Users can delete own workflows" ON user_workflows FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;


-- =============================================================================
-- 28. USER_VAULTS — Encrypted credential storage
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.user_vaults (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,
  iv TEXT NOT NULL,
  salt TEXT NOT NULL,
  key_hint TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE user_vaults ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_vaults' AND policyname = 'vaults_own_read') THEN
    CREATE POLICY vaults_own_read ON user_vaults FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_vaults' AND policyname = 'vaults_own_insert') THEN
    CREATE POLICY vaults_own_insert ON user_vaults FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_vaults' AND policyname = 'vaults_own_delete') THEN
    CREATE POLICY vaults_own_delete ON user_vaults FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_vaults_user ON user_vaults(user_id);


-- =============================================================================
-- 29. WORKFLOW_FILES — User workflow file storage
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.workflow_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT DEFAULT '1.0.0',
  step_count INT DEFAULT 0,
  services_used TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  execution_count INT DEFAULT 0,
  last_executed_at TIMESTAMPTZ,
  workflow_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE workflow_files ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_files' AND policyname = 'wf_own_read') THEN
    CREATE POLICY wf_own_read ON workflow_files FOR SELECT USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_files' AND policyname = 'wf_own_insert') THEN
    CREATE POLICY wf_own_insert ON workflow_files FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_files' AND policyname = 'wf_own_update') THEN
    CREATE POLICY wf_own_update ON workflow_files FOR UPDATE USING (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workflow_files' AND policyname = 'wf_own_delete') THEN
    CREATE POLICY wf_own_delete ON workflow_files FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workflow_files_owner ON workflow_files(owner_id);


-- =============================================================================
-- 30. MAP EXISTING THREADS TO GROUPS (if any exist without group_id)
-- =============================================================================

UPDATE community_threads SET group_id = (
  SELECT id FROM community_groups WHERE slug = community_threads.category
) WHERE group_id IS NULL AND category IS NOT NULL;


-- =============================================================================
-- 31. FIX SPECIFIC USER DATA
-- =============================================================================

-- Mark mike@rocketopp.com as onboarding completed
UPDATE profiles
SET onboarding_completed = true, onboarding_step = 5
WHERE email = 'mike@rocketopp.com';


-- =============================================================================
-- 32. GRANT PERMISSIONS FOR increment_view_count
-- =============================================================================
-- The increment_view_count function is called via supabase.rpc() from both
-- anon and authenticated contexts. Grant execute to both roles.

DO $$
BEGIN
  GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon;
  GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
EXCEPTION WHEN OTHERS THEN
  -- Roles may not exist in all environments
  NULL;
END $$;


-- =============================================================================
-- DONE
-- =============================================================================
-- This migration reconciles the production database with the full codebase.
-- All operations are idempotent and preserve existing data.
-- =============================================================================
