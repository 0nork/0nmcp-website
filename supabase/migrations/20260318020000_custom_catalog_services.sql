-- Custom catalog services added via admin UI
-- These extend the snapshot from catalog-snapshot.json at runtime
-- When a service is wired into 0nMCP/catalog.js and sync'd, remove it from here

CREATE TABLE IF NOT EXISTS custom_catalog_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  base_url TEXT DEFAULT '',
  auth_type TEXT DEFAULT 'api_key',
  category TEXT DEFAULT 'other',
  actions JSONB NOT NULL DEFAULT '[]',
  action_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE custom_catalog_services ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (admin routes use service role)
CREATE POLICY "Service role full access" ON custom_catalog_services
  FOR ALL USING (true) WITH CHECK (true);

-- Index for quick lookup
CREATE INDEX idx_custom_catalog_service_id ON custom_catalog_services(service_id);
