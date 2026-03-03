-- Persona Content Queue: pre-generated forum content posted on schedule.
-- Content generated in Claude Code (zero API cost), cron picks it up.

CREATE TABLE IF NOT EXISTS persona_content_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  persona_slug TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('thread', 'reply')),
  title TEXT,                          -- for threads only
  body TEXT NOT NULL,
  group_slug TEXT DEFAULT 'general',   -- for threads only
  target_thread_slug TEXT,             -- for replies: match to community_threads.slug
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'posted', 'failed', 'skipped')),
  posted_at TIMESTAMPTZ,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fast lookup for pending items
CREATE INDEX idx_content_queue_pending
  ON persona_content_queue (scheduled_at ASC)
  WHERE status = 'queued';

CREATE INDEX idx_content_queue_persona
  ON persona_content_queue (persona_slug);

-- RLS: service role only (no public access)
ALTER TABLE persona_content_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on content queue"
  ON persona_content_queue
  FOR ALL
  USING (true)
  WITH CHECK (true);
