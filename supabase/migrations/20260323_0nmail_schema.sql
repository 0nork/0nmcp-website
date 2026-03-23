-- 0nMail core tables

-- Provider connections (all credentials stored encrypted via Vault)
CREATE TABLE onmail_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_type TEXT NOT NULL,
  -- VALUES: 'sendgrid' | 'ses' | 'smartlead' | 'instantly' |
  --         'google_workspace' | 'microsoft_365' | 'godaddy'
  vault_key_ref TEXT NOT NULL, -- reference to Vault encrypted credential
  status TEXT DEFAULT 'active', -- active | paused | error
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Managed inboxes
CREATE TABLE onmail_inboxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address TEXT NOT NULL UNIQUE,
  domain TEXT NOT NULL,
  provider TEXT NOT NULL, -- google_workspace | microsoft_365
  warmup_provider TEXT, -- smartlead | instantly
  warmup_status TEXT DEFAULT 'pending', -- pending | active | paused | complete
  warmup_day INTEGER DEFAULT 0, -- day in warmup cycle
  health_score INTEGER DEFAULT 0, -- 0-100
  daily_send_limit INTEGER DEFAULT 30, -- increases as warmup progresses
  dns_configured BOOLEAN DEFAULT FALSE,
  spf_verified BOOLEAN DEFAULT FALSE,
  dkim_verified BOOLEAN DEFAULT FALSE,
  dmarc_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sending domains
CREATE TABLE onmail_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  domain TEXT NOT NULL,
  registrar TEXT, -- godaddy | cloudflare | namecheap
  dns_provider_ref TEXT,
  health_score INTEGER DEFAULT 0,
  spam_score DECIMAL(4,2) DEFAULT 0,
  blacklist_status JSONB DEFAULT '{}',
  last_checked_at TIMESTAMPTZ,
  auto_pause_threshold INTEGER DEFAULT 40, -- pause if health drops below
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sequences
CREATE TABLE onmail_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icp_description TEXT, -- plain English ICP used to generate copy
  steps JSONB NOT NULL DEFAULT '[]',
  -- steps: [{step: 1, subject: "", body: "",  delay_days: 0,
  --          variant_a: {}, variant_b: {}, lvos_weight: 0.5}]
  provider_sequence_id TEXT, -- ID in Smartlead or Instantly
  provider TEXT, -- smartlead | instantly
  status TEXT DEFAULT 'draft', -- draft | active | paused | complete
  lvos_winning_variant TEXT, -- a | b | null
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaigns
CREATE TABLE onmail_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sequence_id UUID REFERENCES onmail_sequences(id),
  inbox_ids UUID[] DEFAULT '{}',
  contact_source TEXT, -- listkit | csv | manual | api | crm
  contact_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft', -- draft | scheduled | active | paused | complete
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  stats JSONB DEFAULT '{
    "sent": 0, "delivered": 0, "opened": 0,
    "clicked": 0, "replied": 0, "bounced": 0,
    "unsubscribed": 0, "meetings_booked": 0
  }',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contacts within campaigns
CREATE TABLE onmail_campaign_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES onmail_campaigns(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  title TEXT,
  linkedin_url TEXT,
  personalization_data JSONB DEFAULT '{}',
  -- linkedin activity, recent posts, job change flag, mutual connections
  intent_score INTEGER DEFAULT 0, -- CRO9 score
  status TEXT DEFAULT 'pending',
  -- pending | sent | opened | clicked | replied | bounced | unsubscribed
  sequence_step INTEGER DEFAULT 0,
  last_sent_at TIMESTAMPTZ,
  last_opened_at TIMESTAMPTZ,
  last_replied_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reply intelligence
CREATE TABLE onmail_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES onmail_campaigns(id),
  contact_id UUID REFERENCES onmail_campaign_contacts(id),
  from_email TEXT NOT NULL,
  subject TEXT,
  body_preview TEXT,
  classification TEXT,
  -- positive | negative | ooo | unsubscribe | bounce | referral
  sentiment_score DECIMAL(4,2),
  ai_draft_response TEXT,
  status TEXT DEFAULT 'unread',
  -- unread | reviewed | responded | archived
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deliverability events log
CREATE TABLE onmail_deliverability_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inbox_id UUID REFERENCES onmail_inboxes(id),
  domain_id UUID REFERENCES onmail_domains(id),
  event_type TEXT NOT NULL,
  -- health_check | spam_score | blacklist_check |
  -- dns_verify | warmup_progress | auto_pause
  score_before INTEGER,
  score_after INTEGER,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_onmail_providers_user ON onmail_providers(user_id);
CREATE INDEX idx_onmail_inboxes_user ON onmail_inboxes(user_id);
CREATE INDEX idx_onmail_inboxes_domain ON onmail_inboxes(domain);
CREATE INDEX idx_onmail_domains_user ON onmail_domains(user_id);
CREATE INDEX idx_onmail_sequences_user ON onmail_sequences(user_id);
CREATE INDEX idx_onmail_campaigns_user ON onmail_campaigns(user_id);
CREATE INDEX idx_onmail_campaigns_status ON onmail_campaigns(status);
CREATE INDEX idx_onmail_contacts_campaign ON onmail_campaign_contacts(campaign_id);
CREATE INDEX idx_onmail_contacts_status ON onmail_campaign_contacts(status);
CREATE INDEX idx_onmail_contacts_email ON onmail_campaign_contacts(email);
CREATE INDEX idx_onmail_replies_user ON onmail_replies(user_id);
CREATE INDEX idx_onmail_replies_campaign ON onmail_replies(campaign_id);
CREATE INDEX idx_onmail_deliverability_inbox ON onmail_deliverability_log(inbox_id);

-- RLS policies
ALTER TABLE onmail_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE onmail_inboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE onmail_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE onmail_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE onmail_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE onmail_campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE onmail_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE onmail_deliverability_log ENABLE ROW LEVEL SECURITY;

-- All tables: user can only see their own data
CREATE POLICY "Users own their data" ON onmail_providers
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their data" ON onmail_inboxes
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their data" ON onmail_domains
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their data" ON onmail_sequences
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their data" ON onmail_campaigns
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own their data" ON onmail_replies
  FOR ALL USING (auth.uid() = user_id);

-- Campaign contacts: accessible via campaign ownership
CREATE POLICY "Users access own campaign contacts" ON onmail_campaign_contacts
  FOR ALL USING (
    campaign_id IN (
      SELECT id FROM onmail_campaigns WHERE user_id = auth.uid()
    )
  );

-- Deliverability log: accessible via inbox/domain ownership
CREATE POLICY "Users access own deliverability logs" ON onmail_deliverability_log
  FOR ALL USING (
    inbox_id IN (SELECT id FROM onmail_inboxes WHERE user_id = auth.uid())
    OR domain_id IN (SELECT id FROM onmail_domains WHERE user_id = auth.uid())
  );
