-- Add CRM provisioning fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crm_contact_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crm_location_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_crm_contact ON profiles(crm_contact_id);
CREATE INDEX IF NOT EXISTS idx_profiles_crm_location ON profiles(crm_location_id);
