-- tracking_sites: registered sites for tracking
CREATE TABLE IF NOT EXISTS tracking_sites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  domain text NOT NULL,
  site_id uuid DEFAULT gen_random_uuid() UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- tracking_events: raw event data from tracking pixel
CREATE TABLE IF NOT EXISTS tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id uuid REFERENCES tracking_sites(site_id) ON DELETE CASCADE,
  page_url text,
  referrer text,
  event_type text DEFAULT 'pageview',
  device text,
  browser text,
  country text,
  session_id text,
  created_at timestamptz DEFAULT now()
);

-- Indexes for fast querying
CREATE INDEX IF NOT EXISTS idx_tracking_events_site_id ON tracking_events(site_id);
CREATE INDEX IF NOT EXISTS idx_tracking_events_created ON tracking_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_events_site_created ON tracking_events(site_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tracking_sites_user ON tracking_sites(user_id);

-- RLS
ALTER TABLE tracking_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracking_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their sites" ON tracking_sites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Events visible to site owner" ON tracking_events FOR SELECT USING (
  site_id IN (SELECT site_id FROM tracking_sites WHERE user_id = auth.uid())
);
CREATE POLICY "Anyone can insert events" ON tracking_events FOR INSERT WITH CHECK (true);
