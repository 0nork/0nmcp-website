-- ============================================================
-- 005: Reddit-Style Community Hub
-- Adds: groups (subreddits), votes, karma, badges, memberships
-- ============================================================

-- ==================== COMMUNITY GROUPS (Subreddits) ====================

CREATE TABLE IF NOT EXISTS community_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,                          -- emoji or icon identifier
  color TEXT DEFAULT '#00ff88',       -- group accent color
  rules TEXT,                         -- group-specific rules (markdown)
  is_default BOOLEAN DEFAULT false,   -- shows in sidebar by default
  is_official BOOLEAN DEFAULT false,  -- maintained by 0nMCP team
  member_count INT DEFAULT 0,
  thread_count INT DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default groups
INSERT INTO community_groups (name, slug, description, icon, color, is_default, is_official) VALUES
  ('General',         'general',         'General discussion about 0nMCP and AI orchestration',           '💬', '#00ff88', true,  true),
  ('Help & Support',  'help',            'Ask questions and get help from the community',                  '🆘', '#ff6b35', true,  true),
  ('Showcase',        'showcase',        'Show off what you''ve built with 0nMCP',                         '🚀', '#9945ff', true,  true),
  ('Feature Requests','feature-requests', 'Suggest and vote on new features',                              '💡', '#00d4ff', true,  true),
  ('Bug Reports',     'bug-reports',     'Report bugs and track fixes',                                    '🐛', '#ff3d3d', true,  true),
  ('Tutorials',       'tutorials',       'Share tutorials, guides, and walkthroughs',                      '📚', '#FFD700', true,  true),
  ('Workflows',       'workflows',       'Share and discuss .0n workflow files and RUNs',                   '⚡', '#ff69b4', true,  true),
  ('Integrations',    'integrations',    'Discuss service integrations and API connections',                '🔗', '#20b2aa', true,  true),
  ('Off Topic',       'off-topic',       'Anything goes (within reason)',                                   '🎲', '#888888', true,  true)
ON CONFLICT (slug) DO NOTHING;

-- ==================== GROUP MEMBERSHIPS ====================

CREATE TABLE IF NOT EXISTS community_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_id UUID NOT NULL REFERENCES community_groups(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'moderator', 'admin')),
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, group_id)
);

-- ==================== VOTES (Upvote/Downvote) ====================

CREATE TABLE IF NOT EXISTS community_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  thread_id UUID REFERENCES community_threads(id) ON DELETE CASCADE,
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  vote SMALLINT NOT NULL CHECK (vote IN (-1, 1)),  -- -1 = downvote, 1 = upvote
  created_at TIMESTAMPTZ DEFAULT now(),
  -- One vote per user per target
  UNIQUE(user_id, thread_id),
  UNIQUE(user_id, post_id),
  -- Must target either thread or post, not both
  CHECK (
    (thread_id IS NOT NULL AND post_id IS NULL) OR
    (thread_id IS NULL AND post_id IS NOT NULL)
  )
);

-- ==================== BADGES ====================

CREATE TABLE IF NOT EXISTS community_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,              -- emoji
  color TEXT,             -- accent color
  tier TEXT DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum', 'diamond')),
  criteria JSONB,         -- { type: 'karma', threshold: 100 } or { type: 'threads', threshold: 10 }
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

-- User badges (many-to-many)
CREATE TABLE IF NOT EXISTS community_user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES community_badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- ==================== ALTER EXISTING TABLES ====================

-- Add group_id and score to threads
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS group_id UUID REFERENCES community_groups(id),
  ADD COLUMN IF NOT EXISTS score INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hot_score FLOAT DEFAULT 0;

-- Add score to posts
ALTER TABLE community_posts
  ADD COLUMN IF NOT EXISTS score INT DEFAULT 0;

-- Add karma and reputation to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS karma INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS reputation_level TEXT DEFAULT 'newcomer'
    CHECK (reputation_level IN ('newcomer', 'member', 'contributor', 'power_user', 'expert', 'legend')),
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS crm_community_contact_id TEXT;

-- ==================== INDEXES ====================

CREATE INDEX IF NOT EXISTS idx_threads_group ON community_threads(group_id);
CREATE INDEX IF NOT EXISTS idx_threads_score ON community_threads(score DESC);
CREATE INDEX IF NOT EXISTS idx_threads_hot ON community_threads(hot_score DESC);
CREATE INDEX IF NOT EXISTS idx_votes_thread ON community_votes(thread_id) WHERE thread_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_post ON community_votes(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_votes_user ON community_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON community_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_group ON community_memberships(group_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON community_user_badges(user_id);

-- ==================== FUNCTIONS ====================

-- Calculate hot score (Reddit's algorithm)
-- Score = log10(max(|score|, 1)) + sign(score) * (created_epoch / 45000)
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

-- ==================== TRIGGERS ====================

-- Thread vote triggers (split INSERT/UPDATE and DELETE to avoid NEW reference in DELETE WHEN)
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

-- Post vote triggers (split INSERT/UPDATE and DELETE to avoid NEW reference in DELETE WHEN)
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

-- ==================== RLS POLICIES ====================

ALTER TABLE community_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_user_badges ENABLE ROW LEVEL SECURITY;

-- Groups: public read, authenticated create
CREATE POLICY "groups_public_read" ON community_groups FOR SELECT USING (true);
CREATE POLICY "groups_auth_insert" ON community_groups FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Memberships: own read/write, public count via group
CREATE POLICY "memberships_own_read" ON community_memberships FOR SELECT USING (true);
CREATE POLICY "memberships_own_insert" ON community_memberships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "memberships_own_delete" ON community_memberships FOR DELETE USING (auth.uid() = user_id);

-- Votes: own read/write
CREATE POLICY "votes_public_read" ON community_votes FOR SELECT USING (true);
CREATE POLICY "votes_own_insert" ON community_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_own_update" ON community_votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "votes_own_delete" ON community_votes FOR DELETE USING (auth.uid() = user_id);

-- Badges: public read
CREATE POLICY "badges_public_read" ON community_badges FOR SELECT USING (true);
CREATE POLICY "user_badges_public_read" ON community_user_badges FOR SELECT USING (true);

-- ==================== MIGRATE EXISTING THREADS ====================
-- Map old categories to groups
UPDATE community_threads SET group_id = (
  SELECT id FROM community_groups WHERE slug = community_threads.category
) WHERE group_id IS NULL;
