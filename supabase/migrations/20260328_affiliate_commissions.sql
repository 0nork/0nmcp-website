-- ============================================
-- Affiliate Commission System
-- Tracks recurring commissions, payouts, and service referrals
-- ============================================

-- Add affiliate-specific fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_tier TEXT DEFAULT 'standard';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_approved_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_payout_email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS affiliate_stripe_account_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_commission_cents INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS pending_commission_cents INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS total_payouts_cents INTEGER DEFAULT 0;

-- Commission records — one per subscription payment
CREATE TABLE IF NOT EXISTS affiliate_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id),
  referred_user_id UUID REFERENCES auth.users(id),
  referral_id UUID REFERENCES affiliate_referrals(id),
  stripe_invoice_id TEXT,
  stripe_subscription_id TEXT,
  payment_amount_cents INTEGER NOT NULL,
  commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.30,
  commission_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  payout_id UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Affiliate payouts — batch payouts to affiliates
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES auth.users(id),
  amount_cents INTEGER NOT NULL,
  method TEXT NOT NULL DEFAULT 'stripe_transfer',
  stripe_transfer_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  commissions_included UUID[] DEFAULT '{}',
  notes TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Service affiliate links — our referral links for external services
CREATE TABLE IF NOT EXISTS service_affiliate_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id TEXT NOT NULL UNIQUE,
  service_name TEXT NOT NULL,
  affiliate_url TEXT,
  affiliate_program_url TEXT,
  commission_type TEXT,
  commission_value TEXT,
  cookie_duration TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Affiliate click tracking
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_code TEXT NOT NULL,
  referrer_id UUID REFERENCES auth.users(id),
  page_url TEXT,
  ip_hash TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_referrer ON affiliate_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_status ON affiliate_commissions(status);
CREATE INDEX IF NOT EXISTS idx_affiliate_commissions_sub ON affiliate_commissions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON affiliate_clicks(referral_code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_created ON affiliate_clicks(created_at);
CREATE INDEX IF NOT EXISTS idx_service_affiliate_service ON service_affiliate_links(service_id);

-- RLS
ALTER TABLE affiliate_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_affiliate_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Affiliates see their own commissions
CREATE POLICY "Users see own commissions" ON affiliate_commissions
  FOR SELECT USING (referrer_id = auth.uid());

-- Affiliates see their own payouts
CREATE POLICY "Users see own payouts" ON affiliate_payouts
  FOR SELECT USING (affiliate_id = auth.uid());

-- Service affiliate links are public (displayed on integration pages)
CREATE POLICY "Anyone can read service affiliate links" ON service_affiliate_links
  FOR SELECT USING (true);

-- Click tracking: insert-only for anon, read own for users
CREATE POLICY "Anyone can insert clicks" ON affiliate_clicks
  FOR INSERT WITH CHECK (true);

-- Service role has full access to all tables
CREATE POLICY "Service role full access commissions" ON affiliate_commissions
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access payouts" ON affiliate_payouts
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access service links" ON service_affiliate_links
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role full access clicks" ON affiliate_clicks
  FOR ALL USING (auth.role() = 'service_role');

-- Update the signup trigger to capture referred_by from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  suffix TEXT;
  ref_code TEXT;
  referrer_user_id UUID;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    LOWER(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', '')),
    'user_' || LEFT(NEW.id::text, 8)
  );

  final_username := base_username;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username AND id != NEW.id) THEN
    suffix := LEFT(md5(random()::text), 4);
    final_username := base_username || '_' || suffix;
  END IF;

  -- Get referral code from user metadata
  ref_code := NEW.raw_user_meta_data->>'referred_by';

  INSERT INTO public.profiles (
    id, email, full_name, company, username, avatar_url, auth_provider,
    role, plan, is_admin, onboarding_completed, onboarding_step, referred_by
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'display_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
    'member', 'free', false, false, 0,
    ref_code
  )
  ON CONFLICT (id) DO UPDATE SET
    avatar_url = CASE WHEN EXCLUDED.avatar_url != '' THEN EXCLUDED.avatar_url ELSE profiles.avatar_url END,
    auth_provider = CASE WHEN EXCLUDED.auth_provider != 'email' THEN EXCLUDED.auth_provider ELSE profiles.auth_provider END,
    full_name = CASE WHEN profiles.full_name = '' OR profiles.full_name IS NULL THEN EXCLUDED.full_name ELSE profiles.full_name END,
    referred_by = CASE WHEN profiles.referred_by IS NULL THEN EXCLUDED.referred_by ELSE profiles.referred_by END;

  -- If referred, create affiliate_referrals record
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    SELECT id INTO referrer_user_id FROM public.profiles WHERE referral_code = ref_code LIMIT 1;
    IF referrer_user_id IS NOT NULL THEN
      INSERT INTO public.affiliate_referrals (referrer_id, referral_code, referred_email, referred_user_id, status)
      VALUES (referrer_user_id, ref_code, NEW.email, NEW.id, 'pending')
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Seed our service affiliate links for all 55 services
INSERT INTO service_affiliate_links (service_id, service_name, affiliate_url, affiliate_program_url, commission_type, commission_value, cookie_duration, notes) VALUES
  ('stripe', 'Stripe', 'https://stripe.com', 'https://stripe.com/partners/become-a-partner', 'referral', 'Revenue share', '90 days', 'Stripe Partner Program — apply for revenue share'),
  ('supabase', 'Supabase', 'https://supabase.com', 'https://supabase.com/partners/integrations', 'referral', 'Revenue share', '30 days', 'Supabase Integrations Partner'),
  ('sendgrid', 'SendGrid', 'https://sendgrid.com', 'https://sendgrid.com/partners/', 'referral', 'Revenue share', '30 days', 'Twilio/SendGrid Partner Program'),
  ('slack', 'Slack', 'https://slack.com', 'https://slack.com/partners', 'referral', 'N/A', 'N/A', 'Slack App Directory — no direct commission'),
  ('discord', 'Discord', 'https://discord.com', NULL, 'none', 'N/A', 'N/A', 'No affiliate program'),
  ('twilio', 'Twilio', 'https://twilio.com', 'https://twilio.com/partners', 'referral', 'Revenue share', '90 days', 'Twilio Partner Program'),
  ('github', 'GitHub', 'https://github.com', NULL, 'none', 'N/A', 'N/A', 'No direct affiliate program'),
  ('shopify', 'Shopify', 'https://shopify.com', 'https://www.shopify.com/affiliates', 'CPA', '$150/referral', '30 days', 'Shopify Affiliate Program — $150 per paid merchant'),
  ('openai', 'OpenAI', 'https://openai.com', NULL, 'none', 'N/A', 'N/A', 'No affiliate program yet'),
  ('anthropic', 'Anthropic', 'https://anthropic.com', NULL, 'none', 'N/A', 'N/A', 'No affiliate program yet'),
  ('gmail', 'Gmail', 'https://workspace.google.com', 'https://workspace.google.com/partners/', 'referral', 'Revenue share', '90 days', 'Google Workspace Partner Program'),
  ('google_sheets', 'Google Sheets', 'https://workspace.google.com', 'https://workspace.google.com/partners/', 'referral', 'Revenue share', '90 days', 'Via Google Workspace Partner'),
  ('google_drive', 'Google Drive', 'https://workspace.google.com', 'https://workspace.google.com/partners/', 'referral', 'Revenue share', '90 days', 'Via Google Workspace Partner'),
  ('google_calendar', 'Google Calendar', 'https://workspace.google.com', 'https://workspace.google.com/partners/', 'referral', 'Revenue share', '90 days', 'Via Google Workspace Partner'),
  ('google_ads', 'Google Ads', 'https://ads.google.com', 'https://www.google.com/partners/', 'referral', 'Revenue share', '90 days', 'Google Partners Program'),
  ('airtable', 'Airtable', 'https://airtable.com', 'https://airtable.com/partners', 'referral', 'Revenue share', '30 days', 'Airtable Partner Program'),
  ('notion', 'Notion', 'https://notion.so', 'https://www.notion.so/affiliates', 'CPA', '50% first year', '90 days', 'Notion Affiliate — 50% of first year subscription'),
  ('mongodb', 'MongoDB', 'https://mongodb.com', 'https://www.mongodb.com/partners', 'referral', 'Revenue share', '90 days', 'MongoDB Partner Program'),
  ('zendesk', 'Zendesk', 'https://zendesk.com', 'https://www.zendesk.com/partner/', 'referral', 'Revenue share', '90 days', 'Zendesk Partner Program'),
  ('jira', 'Jira', 'https://atlassian.com', 'https://www.atlassian.com/partners', 'referral', 'Revenue share', '90 days', 'Atlassian Partner Program'),
  ('hubspot', 'HubSpot', 'https://hubspot.com', 'https://www.hubspot.com/partners/affiliate', 'recurring', '30% recurring', '180 days', 'HubSpot Affiliate — 30% recurring commission, 180-day cookie'),
  ('mailchimp', 'Mailchimp', 'https://mailchimp.com', 'https://mailchimp.com/partner-program/', 'referral', 'Revenue share', '30 days', 'Mailchimp Partner Program'),
  ('calendly', 'Calendly', 'https://calendly.com', NULL, 'none', 'N/A', 'N/A', 'No public affiliate program'),
  ('zoom', 'Zoom', 'https://zoom.us', 'https://zoom.us/partners', 'referral', 'Revenue share', '90 days', 'Zoom Partner Program'),
  ('linear', 'Linear', 'https://linear.app', NULL, 'none', 'N/A', 'N/A', 'No affiliate program'),
  ('microsoft', 'Microsoft', 'https://microsoft.com', 'https://partner.microsoft.com', 'referral', 'Revenue share', '90 days', 'Microsoft Partner Network'),
  ('quickbooks', 'QuickBooks', 'https://quickbooks.intuit.com', 'https://quickbooks.intuit.com/partners/', 'recurring', 'Revenue share', '90 days', 'QuickBooks ProAdvisor/Affiliate'),
  ('asana', 'Asana', 'https://asana.com', 'https://asana.com/partners', 'referral', 'Revenue share', '30 days', 'Asana Partner Program'),
  ('intercom', 'Intercom', 'https://intercom.com', 'https://www.intercom.com/partner-program', 'referral', 'Revenue share', '90 days', 'Intercom Partner Program'),
  ('dropbox', 'Dropbox', 'https://dropbox.com', 'https://www.dropbox.com/referrals', 'CPA', 'Free storage credits', '30 days', 'Dropbox Referral Program'),
  ('whatsapp', 'WhatsApp Business', 'https://business.whatsapp.com', NULL, 'none', 'N/A', 'N/A', 'No affiliate — use via Twilio Partner'),
  ('instagram', 'Instagram', 'https://instagram.com', NULL, 'none', 'N/A', 'N/A', 'No direct affiliate'),
  ('twitter', 'Twitter/X', 'https://x.com', NULL, 'none', 'N/A', 'N/A', 'No affiliate program'),
  ('linkedin', 'LinkedIn', 'https://linkedin.com', 'https://business.linkedin.com/marketing-solutions/partners', 'referral', 'Revenue share', '90 days', 'LinkedIn Marketing Partners'),
  ('pipedrive', 'Pipedrive', 'https://pipedrive.com', 'https://www.pipedrive.com/en/affiliates', 'recurring', '33% recurring', '60 days', 'Pipedrive Affiliate — 33% recurring'),
  ('square', 'Square', 'https://squareup.com', 'https://squareup.com/partners', 'referral', 'Revenue share', '90 days', 'Square Partner Program'),
  ('plaid', 'Plaid', 'https://plaid.com', 'https://plaid.com/partners/', 'referral', 'Revenue share', '90 days', 'Plaid Partner Program'),
  ('resend', 'Resend', 'https://resend.com', NULL, 'none', 'N/A', 'N/A', 'No affiliate program yet'),
  ('tiktok', 'TikTok', 'https://tiktok.com', NULL, 'none', 'N/A', 'N/A', 'No direct affiliate'),
  ('facebook_ads', 'Facebook Ads', 'https://facebook.com/business', 'https://www.facebook.com/business/marketing-partners', 'referral', 'Revenue share', '90 days', 'Meta Business Partners'),
  ('linkedin_ads', 'LinkedIn Ads', 'https://business.linkedin.com/marketing-solutions', 'https://business.linkedin.com/marketing-solutions/partners', 'referral', 'Revenue share', '90 days', 'LinkedIn Marketing Partners'),
  ('tiktok_ads', 'TikTok Ads', 'https://ads.tiktok.com', 'https://ads.tiktok.com/marketing-api/partner', 'referral', 'Revenue share', '90 days', 'TikTok Marketing Partners'),
  ('instagram_ads', 'Instagram Ads', 'https://facebook.com/business', 'https://www.facebook.com/business/marketing-partners', 'referral', 'Revenue share', '90 days', 'Via Meta Business Partners'),
  ('smartlead', 'Smartlead', 'https://smartlead.ai', 'https://smartlead.ai/affiliate/', 'recurring', '20% recurring', '60 days', 'Smartlead Affiliate — 20% recurring'),
  ('zapier', 'Zapier', 'https://zapier.com', 'https://zapier.com/partners', 'referral', 'Revenue share', '90 days', 'Zapier Partner Program'),
  ('cloudflare', 'Cloudflare', 'https://cloudflare.com', 'https://www.cloudflare.com/partners/', 'referral', 'Revenue share', '90 days', 'Cloudflare Partner Program'),
  ('godaddy', 'GoDaddy', 'https://godaddy.com', 'https://www.godaddy.com/affiliate-programs', 'CPA', 'Up to $150/sale', '45 days', 'GoDaddy Affiliate — up to $150 per sale'),
  ('n8n', 'n8n', 'https://n8n.io', 'https://n8n.io/affiliates', 'recurring', '20% recurring', '90 days', 'n8n Affiliate — 20% recurring'),
  ('make', 'Make', 'https://make.com', 'https://www.make.com/en/partner', 'recurring', '20% recurring', '120 days', 'Make Partner Program — 20% recurring, 120-day cookie'),
  ('crm', 'CRM (GoHighLevel)', 'https://www.gohighlevel.com/?fp_ref=0nmcp', 'https://www.gohighlevel.com/affiliate-program', 'recurring', '40% recurring', '30 days', 'CRM Affiliate — 40% recurring commission'),
  ('aws', 'AWS', 'https://aws.amazon.com', 'https://aws.amazon.com/partners/', 'referral', 'Revenue share', '90 days', 'AWS Partner Network'),
  ('azure', 'Azure', 'https://azure.microsoft.com', 'https://partner.microsoft.com', 'referral', 'Revenue share', '90 days', 'Via Microsoft Partner Network'),
  ('mulesoft', 'MuleSoft', 'https://mulesoft.com', 'https://www.mulesoft.com/partners', 'referral', 'Revenue share', '90 days', 'MuleSoft Partner Program'),
  ('pabbly', 'Pabbly', 'https://pabbly.com', 'https://www.pabbly.com/affiliate/', 'recurring', '30% recurring', '30 days', 'Pabbly Affiliate — 30% lifetime recurring'),
  ('whimsical', 'Whimsical', 'https://whimsical.com', NULL, 'none', 'N/A', 'N/A', 'No affiliate program')
ON CONFLICT (service_id) DO UPDATE SET
  affiliate_url = EXCLUDED.affiliate_url,
  affiliate_program_url = EXCLUDED.affiliate_program_url,
  commission_type = EXCLUDED.commission_type,
  commission_value = EXCLUDED.commission_value,
  cookie_duration = EXCLUDED.cookie_duration,
  notes = EXCLUDED.notes,
  updated_at = now();
