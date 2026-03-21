-- Add welcome_email_sent flag to profiles to prevent duplicate welcome emails
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_email_sent BOOLEAN DEFAULT false;
