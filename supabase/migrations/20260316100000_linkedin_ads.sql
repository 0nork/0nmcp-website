-- LinkedIn Advertising support columns
ALTER TABLE linkedin_members
  ADD COLUMN IF NOT EXISTS ad_account_ids TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS ads_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS organization_id TEXT;
