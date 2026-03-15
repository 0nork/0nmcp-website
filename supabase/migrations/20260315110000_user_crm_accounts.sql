-- User CRM Accounts — maps 0n users to CRM sub-accounts
-- Each user gets a CRM sub-location with their own knowledge base and agents

CREATE TABLE IF NOT EXISTS user_crm_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_id TEXT NOT NULL,           -- CRM sub-account location ID
  contact_id TEXT,                     -- CRM contact ID for this user
  default_agent_id TEXT,               -- Primary agent deployed to this location
  agent_version_id TEXT,               -- Active version for the default agent
  agents JSONB DEFAULT '[]'::JSONB,    -- Array of { id, name, type } for all agents
  execution_count INTEGER DEFAULT 0,   -- Total agent executions (for metering)
  last_execution_at TIMESTAMPTZ,
  provisioned_at TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'active',        -- active, suspended, deprovisioned
  metadata JSONB DEFAULT '{}'::JSONB,  -- Flexible storage for plan info, etc.
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_crm_accounts_user_id ON user_crm_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_crm_accounts_location_id ON user_crm_accounts(location_id);

-- Session tracking for multi-turn agent conversations
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  execution_id TEXT NOT NULL,          -- CRM Agent Studio executionId
  agent_id TEXT NOT NULL,              -- Which agent this session is with
  location_id TEXT NOT NULL,           -- Which CRM location
  message_count INTEGER DEFAULT 0,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_agent_sessions_user_id ON agent_sessions(user_id);

-- Add agent studio fields to profiles for quick access
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crm_location_id TEXT DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS crm_contact_id TEXT DEFAULT NULL;

COMMENT ON TABLE user_crm_accounts IS 'Maps 0n users to CRM sub-accounts for Agent Studio';
COMMENT ON TABLE agent_sessions IS 'Tracks multi-turn agent conversations via executionId';
