-- Migration: listkit_imports
-- Description: Create listkit_imports table for logging B2B leads imported from ListKit via 0nMCP workflows
-- Target: yaehbwimocvvnnlojkxe (0nork Customers)
-- Author: supabase-db-manager
-- Date: 2026-03-05

-- UP
CREATE TABLE IF NOT EXISTS listkit_imports (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  first_name text,
  last_name text,
  company text,
  title text,
  phone text,
  industry text,
  employee_count text,
  linkedin_url text,
  location text,
  lead_score integer,
  lead_grade text CHECK (lead_grade IN ('A', 'B', 'C', 'D')),
  company_tier text CHECK (company_tier IN ('startup', 'smb', 'mid_market', 'enterprise', 'unknown')),
  intent_signals jsonb DEFAULT '[]'::jsonb,
  list_name text DEFAULT 'ListKit Import',
  batch_id text,
  crm_contact_id text,
  crm_opportunity_id text,
  routing text CHECK (routing IN ('HOT', 'WARM', 'NURTURE', 'DRIP')),
  imported_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX idx_listkit_imports_email ON listkit_imports(email);
CREATE INDEX idx_listkit_imports_lead_grade ON listkit_imports(lead_grade);
CREATE INDEX idx_listkit_imports_batch_id ON listkit_imports(batch_id);
CREATE INDEX idx_listkit_imports_imported_at ON listkit_imports(imported_at DESC);
CREATE INDEX idx_listkit_imports_company ON listkit_imports(company);

-- Enable RLS
ALTER TABLE listkit_imports ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (workflows run with service role key)
CREATE POLICY "Service role full access" ON listkit_imports
  FOR ALL USING (auth.role() = 'service_role');
