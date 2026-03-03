-- Email settings table for admin notification configuration
CREATE TABLE IF NOT EXISTS email_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default settings
INSERT INTO email_settings (key, value) VALUES
  ('notifications', '{"welcome_email": true, "password_reset": true, "admin_new_thread": false, "weekly_digest": false}'),
  ('templates', '{"welcome": "default", "confirmation": "default", "reset": "default", "magic_link": "default"}')
ON CONFLICT (key) DO NOTHING;

-- RLS: Only service role can access (admin API uses service role key)
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role full access (no user-facing RLS policies needed)
CREATE POLICY "Service role full access" ON email_settings
  FOR ALL
  USING (true)
  WITH CHECK (true);
