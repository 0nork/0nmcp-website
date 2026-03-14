-- 0nReply Comments Schema

CREATE TABLE IF NOT EXISTS post_comments (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id             UUID NOT NULL REFERENCES linkedin_members(id) ON DELETE CASCADE,
  post_id               UUID REFERENCES automated_posts(id) ON DELETE SET NULL,
  linkedin_post_urn     TEXT NOT NULL,
  linkedin_comment_id   TEXT NOT NULL UNIQUE,
  commenter_name        TEXT NOT NULL,
  commenter_linkedin_id TEXT,
  commenter_headline    TEXT,
  comment_text          TEXT NOT NULL,
  comment_posted_at     TIMESTAMPTZ NOT NULL,
  intent                TEXT CHECK (intent IN ('challenge','question','praise','spam','neutral','troll')),
  intent_confidence     REAL DEFAULT 0.0,
  sentiment_score       REAL DEFAULT 0.0,
  priority              TEXT DEFAULT 'normal' CHECK (priority IN ('high','normal','low','skip')),
  fetched_at            TIMESTAMPTZ DEFAULT now(),
  processed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_post_comments_member    ON post_comments(member_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_urn  ON post_comments(linkedin_post_urn);
CREATE INDEX IF NOT EXISTS idx_post_comments_intent    ON post_comments(intent);
CREATE INDEX IF NOT EXISTS idx_post_comments_unproc    ON post_comments(processed_at) WHERE processed_at IS NULL;

CREATE TABLE IF NOT EXISTS comment_reply_drafts (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id            UUID NOT NULL REFERENCES post_comments(id) ON DELETE CASCADE,
  member_id             UUID NOT NULL REFERENCES linkedin_members(id) ON DELETE CASCADE,
  draft_text            TEXT NOT NULL,
  draft_version         INTEGER DEFAULT 1,
  lvos_variant_id       UUID REFERENCES lvos_variants(id),
  lvos_selection_id     UUID REFERENCES lvos_selections(id),
  status                TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','posted','rejected','edited')),
  approved_at           TIMESTAMPTZ,
  posted_at             TIMESTAMPTZ,
  linkedin_reply_id     TEXT,
  edited_text           TEXT,
  rejection_reason      TEXT,
  auto_post_eligible    BOOLEAN DEFAULT false,
  confidence_score      REAL DEFAULT 0.0,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_drafts_member  ON comment_reply_drafts(member_id);
CREATE INDEX IF NOT EXISTS idx_drafts_status  ON comment_reply_drafts(status) WHERE status IN ('pending','approved');
CREATE UNIQUE INDEX IF NOT EXISTS idx_drafts_comment_active
  ON comment_reply_drafts(comment_id)
  WHERE status IN ('pending','approved');

CREATE TABLE IF NOT EXISTS comment_reply_outcomes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id                UUID NOT NULL REFERENCES comment_reply_drafts(id) ON DELETE CASCADE,
  member_id               UUID NOT NULL REFERENCES linkedin_members(id) ON DELETE CASCADE,
  lvos_variant_id         UUID REFERENCES lvos_variants(id),
  original_comment_intent TEXT,
  was_edited              BOOLEAN DEFAULT false,
  was_auto_posted         BOOLEAN DEFAULT false,
  commenter_replied       BOOLEAN DEFAULT false,
  observation_window_end  TIMESTAMPTZ,
  outcome_recorded_at     TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS member_comment_settings (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id            UUID NOT NULL UNIQUE REFERENCES linkedin_members(id) ON DELETE CASCADE,
  monitoring_enabled   BOOLEAN DEFAULT true,
  auto_reply_enabled   BOOLEAN DEFAULT false,
  auto_reply_threshold REAL DEFAULT 0.85,
  reply_to_challenges  BOOLEAN DEFAULT true,
  reply_to_questions   BOOLEAN DEFAULT true,
  reply_to_praise      BOOLEAN DEFAULT false,
  skip_spam            BOOLEAN DEFAULT true,
  skip_trolls          BOOLEAN DEFAULT true,
  posts_to_monitor     INTEGER DEFAULT 10,
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE post_comments           ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reply_drafts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_reply_outcomes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_comment_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own comments" ON post_comments
  FOR ALL USING (member_id IN (SELECT id FROM linkedin_members WHERE user_id = auth.uid()));
CREATE POLICY "own drafts" ON comment_reply_drafts
  FOR ALL USING (member_id IN (SELECT id FROM linkedin_members WHERE user_id = auth.uid()));
CREATE POLICY "own outcomes" ON comment_reply_outcomes
  FOR ALL USING (member_id IN (SELECT id FROM linkedin_members WHERE user_id = auth.uid()));
CREATE POLICY "own settings" ON member_comment_settings
  FOR ALL USING (member_id IN (SELECT id FROM linkedin_members WHERE user_id = auth.uid()));

-- Default settings for owner
INSERT INTO member_comment_settings (member_id, monitoring_enabled, auto_reply_enabled, reply_to_challenges, reply_to_questions, reply_to_praise, posts_to_monitor)
SELECT id, true, false, true, true, false, 15
FROM linkedin_members
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'mike@rocketopp.com' LIMIT 1)
ON CONFLICT (member_id) DO NOTHING;
