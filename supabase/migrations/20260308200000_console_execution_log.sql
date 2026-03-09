-- Console execution log — tracks every workflow execution for billing + reporting
-- Each row = 1 metered billing event ($0.10) reported to Stripe

CREATE TABLE IF NOT EXISTS console_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task TEXT,
  workflow_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  duration_ms INTEGER,
  steps_executed INTEGER DEFAULT 0,
  services_used TEXT[] DEFAULT '{}',
  result_summary TEXT,
  error_message TEXT,
  stripe_customer_id TEXT,
  billed BOOLEAN DEFAULT false,
  billing_amount_cents INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for reporting
CREATE INDEX IF NOT EXISTS idx_console_exec_user ON console_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_console_exec_date ON console_executions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_console_exec_status ON console_executions(status);
CREATE INDEX IF NOT EXISTS idx_console_exec_billed ON console_executions(billed);

-- Monthly summary materialized view for fast billing reports
CREATE OR REPLACE VIEW console_billing_summary AS
SELECT
  date_trunc('month', created_at) AS month,
  count(*) AS total_executions,
  count(*) FILTER (WHERE status = 'completed') AS successful,
  count(*) FILTER (WHERE status = 'failed') AS failed,
  count(*) FILTER (WHERE billed = true) AS billed_executions,
  sum(CASE WHEN billed THEN billing_amount_cents ELSE 0 END) AS total_revenue_cents,
  count(DISTINCT user_id) AS unique_users
FROM console_executions
GROUP BY date_trunc('month', created_at)
ORDER BY month DESC;

-- Per-user billing summary
CREATE OR REPLACE VIEW console_user_billing AS
SELECT
  user_id,
  count(*) AS total_executions,
  count(*) FILTER (WHERE billed = true) AS billed_executions,
  sum(CASE WHEN billed THEN billing_amount_cents ELSE 0 END) AS total_spent_cents,
  max(created_at) AS last_execution,
  count(*) FILTER (WHERE created_at > now() - interval '30 days') AS executions_30d
FROM console_executions
GROUP BY user_id;

-- RLS
ALTER TABLE console_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on console_executions"
  ON console_executions FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Users can view own executions"
  ON console_executions FOR SELECT
  USING (auth.uid() = user_id);
