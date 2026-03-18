-- CRM Provision Retry Queue
-- When auto-provisioning fails on signup, the failure is queued here.
-- A background job or admin action can retry failed provisions.

CREATE TABLE IF NOT EXISTS crm_provision_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  failed_at TIMESTAMPTZ DEFAULT NOW(),
  retry_count INT DEFAULT 0,
  last_error TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE crm_provision_queue ENABLE ROW LEVEL SECURITY;

-- Service role only — admin/backend access
CREATE POLICY "Service role only" ON crm_provision_queue
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_crm_provision_queue_user ON crm_provision_queue(user_id);
CREATE INDEX idx_crm_provision_queue_unresolved ON crm_provision_queue(resolved) WHERE resolved = FALSE;
