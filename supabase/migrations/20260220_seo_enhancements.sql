-- ============================================
-- SEO Enhancements Migration
-- Source tracking, username, indexes, ROCKET Community group
-- ============================================

-- Source tracking for threads (native vs synced vs persona)
ALTER TABLE community_threads
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'forum'
    CHECK (source IN ('forum', 'crm_sync', 'persona')),
  ADD COLUMN IF NOT EXISTS external_url TEXT;

-- Username for cleaner profile URLs (optional, future /u/username)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- Indexes for sitemap and common queries
CREATE INDEX IF NOT EXISTS idx_threads_slug ON community_threads(slug);
CREATE INDEX IF NOT EXISTS idx_threads_created ON community_threads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_threads_last_reply ON community_threads(last_reply_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON profiles(onboarding_completed) WHERE onboarding_completed = true;

-- Public read policy on profiles for safe fields (profile pages)
-- The API route projects only safe fields — no email, no stripe_customer_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'profiles_public_read' AND tablename = 'profiles'
  ) THEN
    CREATE POLICY profiles_public_read ON profiles
      FOR SELECT USING (true);
  END IF;
END
$$;

-- ROCKET Community group (placeholder for future CRM sync)
INSERT INTO community_groups (name, slug, description, icon, color, is_default, is_official)
VALUES ('ROCKET Community', 'rocket-community', 'Posts from the ROCKET community portal', '🚀', '#ff6b35', false, true)
ON CONFLICT (slug) DO NOTHING;
