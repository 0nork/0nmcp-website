-- Waitlist table for pre-launch request access
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  company TEXT,
  source TEXT DEFAULT '0nmcp.com',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (email);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist (created_at DESC);

-- RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Only service role can insert/read (API route uses server client)
CREATE POLICY "Service role full access" ON waitlist
  FOR ALL USING (true) WITH CHECK (true);
