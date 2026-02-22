-- CRM Marketplace App tables
-- Stores OAuth installations and trigger subscriptions for the 0nMCP marketplace app

-- Marketplace installations (one per CRM location that installs the app)
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

-- Marketplace trigger subscriptions (CRM workflow triggers linked to our app)
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

-- Marketplace action execution logs
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_installations_location ON marketplace_installations(location_id);
CREATE INDEX IF NOT EXISTS idx_triggers_location ON marketplace_triggers(location_id);
CREATE INDEX IF NOT EXISTS idx_triggers_key ON marketplace_triggers(trigger_key);
CREATE INDEX IF NOT EXISTS idx_executions_location ON marketplace_executions(location_id);
CREATE INDEX IF NOT EXISTS idx_executions_action ON marketplace_executions(action_key);
CREATE INDEX IF NOT EXISTS idx_executions_date ON marketplace_executions(executed_at DESC);

-- RLS policies
ALTER TABLE marketplace_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketplace_executions ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (API routes use service role)
CREATE POLICY "Service role full access on installations"
  ON marketplace_installations FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on triggers"
  ON marketplace_triggers FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on executions"
  ON marketplace_executions FOR ALL
  USING (true) WITH CHECK (true);
