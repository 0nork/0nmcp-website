-- Admin Services Management
-- Allows admins to toggle services on/off and set affiliate links

CREATE TABLE IF NOT EXISTS admin_services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  affiliate_url TEXT,
  custom_help_url TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed all 100 services
INSERT INTO admin_services (id, name, category) VALUES
  ('anthropic', 'Anthropic', 'ai'),
  ('openai', 'OpenAI', 'ai'),
  ('gemini', 'Gemini', 'ai'),
  ('perplexity', 'Perplexity', 'ai'),
  ('cohere', 'Cohere', 'ai'),
  ('mistral', 'Mistral AI', 'ai'),
  ('replicate', 'Replicate', 'ai'),
  ('stability', 'Stability AI', 'ai'),
  ('elevenlabs', 'ElevenLabs', 'ai'),
  ('deepgram', 'Deepgram', 'ai'),
  ('groq', 'Groq', 'ai'),
  ('crm', 'CRM', 'crm'),
  ('gohighlevel', 'GoHighLevel', 'crm'),
  ('hubspot', 'HubSpot', 'crm'),
  ('salesforce', 'Salesforce', 'crm'),
  ('pipedrive', 'Pipedrive', 'crm'),
  ('intercom', 'Intercom', 'crm'),
  ('freshdesk', 'Freshdesk', 'crm'),
  ('zendesk', 'Zendesk', 'crm'),
  ('supabase', 'Supabase', 'database'),
  ('mongodb', 'MongoDB', 'database'),
  ('airtable', 'Airtable', 'database'),
  ('planetscale', 'PlanetScale', 'database'),
  ('neon', 'Neon', 'database'),
  ('turso', 'Turso', 'database'),
  ('cockroachdb', 'CockroachDB', 'database'),
  ('stripe', 'Stripe', 'finance'),
  ('square', 'Square', 'finance'),
  ('plaid', 'Plaid', 'finance'),
  ('quickbooks', 'QuickBooks', 'finance'),
  ('xero', 'Xero', 'finance'),
  ('wave', 'Wave', 'finance'),
  ('slack', 'Slack', 'messaging'),
  ('discord', 'Discord', 'messaging'),
  ('whatsapp', 'WhatsApp', 'messaging'),
  ('twilio', 'Twilio', 'messaging'),
  ('zoom', 'Zoom', 'messaging'),
  ('telegram', 'Telegram', 'messaging'),
  ('gmail', 'Gmail', 'email'),
  ('sendgrid', 'SendGrid', 'email'),
  ('resend', 'Resend', 'email'),
  ('mailchimp', 'Mailchimp', 'email'),
  ('outlook', 'Outlook', 'email'),
  ('postmark', 'Postmark', 'email'),
  ('mailgun', 'Mailgun', 'email'),
  ('convertkit', 'Kit (ConvertKit)', 'email'),
  ('brevo', 'Brevo', 'email'),
  ('activecampaign', 'ActiveCampaign', 'email'),
  ('lemlist', 'Lemlist', 'email'),
  ('smartlead', 'Smartlead', 'email'),
  ('github', 'GitHub', 'dev'),
  ('linear', 'Linear', 'dev'),
  ('jira', 'Jira', 'dev'),
  ('webflow', 'Webflow', 'dev'),
  ('mcpfed', 'MCPFED', 'dev'),
  ('vercel', 'Vercel', 'cloud'),
  ('cloudflare', 'Cloudflare', 'cloud'),
  ('netlify', 'Netlify', 'cloud'),
  ('railway', 'Railway', 'cloud'),
  ('render', 'Render', 'cloud'),
  ('aws', 'AWS', 'cloud'),
  ('gcloud', 'Google Cloud', 'cloud'),
  ('azure', 'Microsoft Azure', 'cloud'),
  ('microsoft', 'Microsoft 365', 'cloud'),
  ('dropbox', 'Dropbox', 'cloud'),
  ('google_drive', 'Google Drive', 'cloud'),
  ('linkedin', 'LinkedIn', 'social'),
  ('instagram', 'Instagram', 'social'),
  ('twitter', 'X (Twitter)', 'social'),
  ('tiktok', 'TikTok Business', 'social'),
  ('pinterest', 'Pinterest', 'social'),
  ('youtube', 'YouTube', 'social'),
  ('twitch', 'Twitch', 'social'),
  ('google_ads', 'Google Ads', 'ads'),
  ('facebook_ads', 'Facebook Ads', 'ads'),
  ('linkedin_ads', 'LinkedIn Ads', 'ads'),
  ('tiktok_ads', 'TikTok Ads', 'ads'),
  ('x_ads', 'X Ads', 'ads'),
  ('instagram_ads', 'Instagram Ads', 'ads'),
  ('notion', 'Notion', 'productivity'),
  ('clickup', 'ClickUp', 'productivity'),
  ('asana', 'Asana', 'productivity'),
  ('whimsical', 'Whimsical', 'productivity'),
  ('monday', 'Monday.com', 'productivity'),
  ('figma', 'Figma', 'productivity'),
  ('typeform', 'Typeform', 'productivity'),
  ('loom', 'Loom', 'video'),
  ('docusign', 'DocuSign', 'productivity'),
  ('trello', 'Trello', 'productivity'),
  ('google_sheets', 'Google Sheets', 'productivity'),
  ('google_calendar', 'Google Calendar', 'productivity'),
  ('calendly', 'Calendly', 'productivity'),
  ('shopify', 'Shopify', 'ecommerce'),
  ('woocommerce', 'WooCommerce', 'ecommerce'),
  ('bigcommerce', 'BigCommerce', 'ecommerce'),
  ('wordpress', 'WordPress', 'ecommerce'),
  ('n8n', 'n8n', 'automation'),
  ('zapier', 'Zapier', 'automation'),
  ('mulesoft', 'MuleSoft', 'automation'),
  ('make', 'Make', 'automation')
ON CONFLICT (id) DO NOTHING;

-- RLS: Only admins can manage
ALTER TABLE admin_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage services" ON admin_services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Public read for enabled services
CREATE POLICY "Anyone can read enabled services" ON admin_services
  FOR SELECT USING (is_enabled = true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_admin_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER admin_services_updated_at
  BEFORE UPDATE ON admin_services
  FOR EACH ROW
  EXECUTE FUNCTION update_admin_services_updated_at();
