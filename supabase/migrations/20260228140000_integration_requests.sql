-- Integration request form — users submit requests for new 0nMCP services
CREATE TABLE IF NOT EXISTS integration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  website TEXT,
  category TEXT,
  description TEXT,
  use_case TEXT,
  status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_integration_requests_user ON integration_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_requests_status ON integration_requests(status);
CREATE INDEX IF NOT EXISTS idx_integration_requests_name ON integration_requests(name);

ALTER TABLE integration_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users read own integration requests"
    ON integration_requests FOR SELECT
    USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role full access on integration_requests"
    ON integration_requests FOR ALL
    USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
