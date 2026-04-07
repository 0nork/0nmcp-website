-- Migration: telegram_auth_universal_commands_permissions
-- Description: Telegram Login Widget auth, expanded access tokens, universal commands system,
--              command add-ons marketplace, user add-on purchases, and command execution audit trail.
-- Author: supabase-db-manager
-- Date: 2026-04-06

------------------------------------------------------------
-- 1. telegram_auth — Telegram Login Widget authentication
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS telegram_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  telegram_id bigint NOT NULL UNIQUE,
  telegram_username text,
  telegram_first_name text,
  telegram_last_name text,
  telegram_photo_url text,
  auth_date bigint NOT NULL,
  hash text NOT NULL,
  verified boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_telegram_auth_user_id ON telegram_auth(user_id);
CREATE INDEX IF NOT EXISTS idx_telegram_auth_telegram_id ON telegram_auth(telegram_id);

ALTER TABLE telegram_auth ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on telegram_auth"
  ON telegram_auth FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own telegram_auth"
  ON telegram_auth FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own telegram_auth"
  ON telegram_auth FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

------------------------------------------------------------
-- 2. access_tokens — DROP and recreate with expanded schema
------------------------------------------------------------
DROP TABLE IF EXISTS access_tokens CASCADE;

CREATE TABLE access_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  token_hash text NOT NULL UNIQUE,
  name text NOT NULL DEFAULT 'default',
  permission_level text NOT NULL DEFAULT 'simple'
    CHECK (permission_level IN ('simple', 'full', 'admin', 'temporary')),
  scopes text[] NOT NULL DEFAULT '{read}',
  source text NOT NULL DEFAULT 'console'
    CHECK (source IN ('console', 'telegram', 'api', 'cli', 'bot')),
  expires_at timestamptz,
  last_used_at timestamptz,
  use_count int NOT NULL DEFAULT 0,
  max_uses int,
  ip_whitelist text[],
  is_active boolean NOT NULL DEFAULT true,
  revoked_at timestamptz,
  revoked_reason text,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_access_tokens_token_hash ON access_tokens(token_hash);
CREATE INDEX idx_access_tokens_user_id ON access_tokens(user_id);
CREATE INDEX idx_access_tokens_active ON access_tokens(is_active) WHERE is_active = true;

ALTER TABLE access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on access_tokens"
  ON access_tokens FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own access_tokens"
  ON access_tokens FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own access_tokens"
  ON access_tokens FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own access_tokens"
  ON access_tokens FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own access_tokens"
  ON access_tokens FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

------------------------------------------------------------
-- 3. universal_commands
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS universal_commands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  command text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  usage text,
  args_schema jsonb DEFAULT '{}',
  permission_level text NOT NULL DEFAULT 'simple',
  required_addon text,
  required_plan text,
  is_public boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  surfaces text[] NOT NULL DEFAULT '{console,cli,bot,chat,api}',
  cooldown_seconds int DEFAULT 0,
  daily_limit int,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_universal_commands_category ON universal_commands(category);
CREATE INDEX IF NOT EXISTS idx_universal_commands_command ON universal_commands(command);

ALTER TABLE universal_commands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on universal_commands"
  ON universal_commands FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can read active public commands"
  ON universal_commands FOR SELECT
  TO authenticated, anon
  USING (is_active = true AND is_public = true);

------------------------------------------------------------
-- 4. command_addons
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS command_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  price_monthly numeric,
  price_one_time numeric,
  stripe_product_id text,
  stripe_price_id text,
  upgrade_url text NOT NULL,
  features text[] NOT NULL DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE command_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on command_addons"
  ON command_addons FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Anyone can read active addons"
  ON command_addons FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

------------------------------------------------------------
-- 5. user_addons
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_addons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addon_id uuid NOT NULL REFERENCES command_addons(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'expired', 'cancelled', 'trial')),
  purchased_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  stripe_subscription_id text,
  UNIQUE(user_id, addon_id)
);

CREATE INDEX IF NOT EXISTS idx_user_addons_user_id ON user_addons(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addons_addon_id ON user_addons(addon_id);

ALTER TABLE user_addons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on user_addons"
  ON user_addons FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own addons"
  ON user_addons FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

------------------------------------------------------------
-- 6. command_executions — audit trail
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS command_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  command text NOT NULL,
  surface text NOT NULL,
  args jsonb DEFAULT '{}',
  result_status text NOT NULL DEFAULT 'success'
    CHECK (result_status IN ('success', 'failed', 'denied', 'upgrade_required')),
  denied_reason text,
  token_id uuid REFERENCES access_tokens(id) ON DELETE SET NULL,
  duration_ms int,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_command_executions_user_id ON command_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_command_executions_command ON command_executions(command);
CREATE INDEX IF NOT EXISTS idx_command_executions_created_at ON command_executions(created_at DESC);

ALTER TABLE command_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on command_executions"
  ON command_executions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own executions"
  ON command_executions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

------------------------------------------------------------
-- updated_at triggers
------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_telegram_auth_updated_at
  BEFORE UPDATE ON telegram_auth
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_access_tokens_updated_at
  BEFORE UPDATE ON access_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_universal_commands_updated_at
  BEFORE UPDATE ON universal_commands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- SEED: command_addons
------------------------------------------------------------
INSERT INTO command_addons (slug, name, description, price_monthly, stripe_product_id, stripe_price_id, upgrade_url, features) VALUES
  ('course-generator', 'Course Generator', 'Generate full courses with AI — lessons, quizzes, certificates', 29, NULL, NULL, 'https://0nmcp.com/console/marketplace', '{ai_course_generation,quiz_builder,certificate_templates,scorm_export}'),
  ('onpress', 'OnPress Publisher', 'WordPress + publishing engine — deploy blogs, sites, content', 19, NULL, NULL, 'https://0nmcp.com/console/marketplace', '{wordpress_deploy,content_scheduling,multi_site,seo_optimization}'),
  ('mail-engine', 'Mail Engine', 'Email sequences, campaigns, deliverability monitoring', 39, NULL, NULL, 'https://0nmcp.com/console/marketplace', '{email_sequences,campaign_builder,deliverability_monitor,ab_testing}'),
  ('ads-manager', 'Ads Manager', 'Facebook, Google, LinkedIn ad campaign management', 49, NULL, NULL, 'https://0nmcp.com/console/marketplace', '{facebook_ads,google_ads,linkedin_ads,budget_optimizer,reporting}'),
  ('linkedin-engine', 'LinkedIn Engine', 'Outreach campaigns, automated posts, analytics', 29, NULL, NULL, 'https://0nmcp.com/console/marketplace', '{outreach_campaigns,auto_posting,analytics,connection_requests}'),
  ('site-builder', 'Site Builder', 'AI website generation — describe it, deploy it', 19, NULL, NULL, 'https://0nmcp.com/console/marketplace', '{ai_site_generation,template_library,custom_domains,hosting}'),
  ('security-suite', 'Security Suite', 'API key health checks, vulnerability scanning, alerts', 9, NULL, NULL, 'https://0nmcp.com/console/marketplace', '{api_key_health,vulnerability_scan,security_alerts,compliance_reports}'),
  ('intel-engine', 'Intel Engine', 'Competitive intelligence — monitoring, alerts, reports', 19, NULL, NULL, 'https://0nmcp.com/console/marketplace', '{competitor_monitoring,market_alerts,trend_reports,patent_tracking}');

------------------------------------------------------------
-- SEED: universal_commands
------------------------------------------------------------

-- Core (free)
INSERT INTO universal_commands (command, name, description, category, permission_level, sort_order) VALUES
  ('/start',    'Start',    'Start 0nMCP and see what I can do',              'core', 'simple', 10),
  ('/help',     'Help',     'Show available commands and features',           'core', 'simple', 20),
  ('/status',   'Status',   'Check connected services and account status',    'core', 'simple', 30),
  ('/login',    'Login',    'Authenticate with token or Telegram',            'core', 'simple', 40),
  ('/logout',   'Logout',   'Revoke current session',                         'core', 'simple', 50),
  ('/whoami',   'Who Am I', 'Show current user and permissions',              'core', 'simple', 60),
  ('/commands', 'Commands', 'List all available commands',                     'core', 'simple', 70),
  ('/settings', 'Settings', 'Manage account settings',                        'core', 'simple', 80);

-- Workflows (free)
INSERT INTO universal_commands (command, name, description, category, permission_level, sort_order) VALUES
  ('/run',       'Run Workflow',   'Execute a workflow by name',                       'workflows', 'simple', 100),
  ('/workflows', 'Workflows',     'List saved workflows',                              'workflows', 'simple', 110),
  ('/create',    'Create',        'Create a new workflow from description',             'workflows', 'simple', 120),
  ('/schedule',  'Schedule',      'Schedule a workflow to run on a timer',              'workflows', 'simple', 130);

-- AI (free)
INSERT INTO universal_commands (command, name, description, category, permission_level, sort_order) VALUES
  ('/ask',     'Ask AI',      'Ask the AI a question',                         'ai', 'simple', 200),
  ('/council', 'AI Council',  'Ask the AI Council (multi-model)',              'ai', 'simple', 210),
  ('/chat',    'Chat',        'Start an interactive AI conversation',          'ai', 'simple', 220),
  ('/brain',   'Brain',       'Access your knowledge base',                    'ai', 'simple', 230);

-- CRM (free)
INSERT INTO universal_commands (command, name, description, category, permission_level, sort_order) VALUES
  ('/contacts',      'Contacts',      'Search and manage CRM contacts',           'crm', 'simple', 300),
  ('/pipeline',      'Pipeline',      'View pipeline and opportunities',          'crm', 'simple', 310),
  ('/calendar',      'Calendar',      'Check calendar and appointments',          'crm', 'simple', 320),
  ('/conversations', 'Conversations', 'View CRM conversations',                   'crm', 'simple', 330);

-- Services (free)
INSERT INTO universal_commands (command, name, description, category, permission_level, sort_order) VALUES
  ('/connect',      'Connect',      'Connect a new service integration',     'services', 'simple', 400),
  ('/vault',        'Vault',        'View and manage API keys',              'services', 'simple', 410),
  ('/balance',      'Balance',      'Check RUN balance and usage',           'services', 'simple', 420),
  ('/integrations', 'Integrations', 'View all connected services',           'services', 'simple', 430);

-- Content (free)
INSERT INTO universal_commands (command, name, description, category, permission_level, sort_order) VALUES
  ('/blog',   'Blog',   'Write and publish a blog post',         'content', 'simple', 500),
  ('/social', 'Social', 'Post to social media channels',         'content', 'simple', 510),
  ('/sxo',    'SXO',    'Score content against SXO criteria',    'content', 'simple', 520);

-- Paid add-on commands
INSERT INTO universal_commands (command, name, description, category, permission_level, required_addon, sort_order) VALUES
  ('/generate-course',    'Generate Course',     'Generate a full course with lessons',                  'content',  'simple', 'course-generator', 600),
  ('/onpress',            'OnPress',             'Launch OnPress publishing engine',                     'content',  'simple', 'onpress',          610),
  ('/mail-sequences',     'Mail Sequences',      'Create email sequences',                               'content',  'simple', 'mail-engine',      620),
  ('/facebook-ads',       'Facebook Ads',        'Manage Facebook ad campaigns',                          'services', 'simple', 'ads-manager',      630),
  ('/linkedin-outreach',  'LinkedIn Outreach',   'Run LinkedIn outreach campaigns',                       'services', 'simple', 'linkedin-engine',  640),
  ('/site-builder',       'Site Builder',        'Build a website from description',                      'tools',    'simple', 'site-builder',     650),
  ('/security-scan',      'Security Scan',       'Run security audit on your integrations',               'tools',    'simple', 'security-suite',   660),
  ('/intel',              'Intel',               'Competitive intelligence scanning',                     'tools',    'simple', 'intel-engine',     670);
