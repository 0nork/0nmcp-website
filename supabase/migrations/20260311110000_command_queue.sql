-- 0nCommand ↔ 0nLive Command Queue
-- The bridge between offline (Claude Code) and online (Vercel).
--
-- Pattern:
--   1. VIP admin on 0nLive writes a command to the queue (status: 'pending')
--   2. 0nCommand (offline) picks it up via `/0ncommand sync`
--   3. 0nCommand executes locally (free — MAX plan)
--   4. 0nCommand writes results back (status: 'completed')
--   5. 0nLive reads results and updates UI
--
-- Also supports PUSH direction:
--   0nCommand generates content → writes to push_queue → 0nLive reads on next page load

-- Command Queue — bidirectional message bus
CREATE TABLE IF NOT EXISTS command_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Direction: 'to_offline' (live→command) or 'to_live' (command→live)
  direction TEXT NOT NULL DEFAULT 'to_offline' CHECK (direction IN ('to_offline', 'to_live')),

  -- Command type: training, content_gen, persona_gen, knowledge_push, deploy, custom
  command_type TEXT NOT NULL,

  -- Payload: JSON with all data needed to execute the command
  payload JSONB NOT NULL DEFAULT '{}',

  -- Result: JSON written back after execution
  result JSONB,

  -- Status lifecycle: pending → running → completed | failed | cancelled
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),

  -- Priority: 0 = normal, 1 = high, 2 = urgent
  priority INT DEFAULT 0,

  -- Who created this command
  created_by TEXT NOT NULL DEFAULT 'system',

  -- VIP role check — only VIP admins can create commands
  vip_verified BOOLEAN DEFAULT false,

  -- Timing
  created_at TIMESTAMPTZ DEFAULT now(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Error tracking
  error TEXT,
  retry_count INT DEFAULT 0,
  max_retries INT DEFAULT 3
);

CREATE INDEX idx_cq_status_dir ON command_queue(status, direction);
CREATE INDEX idx_cq_created ON command_queue(created_at DESC);
CREATE INDEX idx_cq_type ON command_queue(command_type);
CREATE INDEX idx_cq_priority ON command_queue(priority DESC, created_at ASC);

ALTER TABLE command_queue ENABLE ROW LEVEL SECURITY;

-- VIP admins can read/write, public can read completed results
CREATE POLICY "VIP admin full access" ON command_queue
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated read own commands" ON command_queue
  FOR SELECT TO authenticated USING (
    created_by = auth.uid()::text OR status = 'completed'
  );

-- Sync Ledger — tracks what has been pushed from 0nCommand to 0nLive
CREATE TABLE IF NOT EXISTS sync_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- What was synced
  sync_type TEXT NOT NULL, -- 'knowledge', 'training_run', 'persona', 'content', 'config'

  -- Reference to the source record
  source_table TEXT NOT NULL,
  source_id TEXT NOT NULL,

  -- Hash of content for dedup
  content_hash TEXT,

  -- Direction
  direction TEXT NOT NULL DEFAULT 'command_to_live'
    CHECK (direction IN ('command_to_live', 'live_to_command')),

  -- Status
  status TEXT DEFAULT 'synced' CHECK (status IN ('synced', 'conflict', 'rollback')),

  synced_at TIMESTAMPTZ DEFAULT now(),
  synced_by TEXT DEFAULT 'system'
);

CREATE INDEX idx_sl_type ON sync_ledger(sync_type);
CREATE INDEX idx_sl_source ON sync_ledger(source_table, source_id);
CREATE UNIQUE INDEX idx_sl_dedup ON sync_ledger(source_table, source_id, direction);

ALTER TABLE sync_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages sync" ON sync_ledger
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated read sync" ON sync_ledger
  FOR SELECT TO authenticated USING (true);

-- VIP Permissions — controls who can interact with 0nCommand from 0nLive
CREATE TABLE IF NOT EXISTS vip_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'vip' CHECK (role IN ('vip', 'admin', 'owner')),

  -- Granular permissions
  can_queue_commands BOOLEAN DEFAULT true,
  can_trigger_training BOOLEAN DEFAULT true,
  can_push_content BOOLEAN DEFAULT true,
  can_view_queue BOOLEAN DEFAULT true,
  can_cancel_commands BOOLEAN DEFAULT false,

  granted_at TIMESTAMPTZ DEFAULT now(),
  granted_by TEXT DEFAULT 'system',
  expires_at TIMESTAMPTZ,

  UNIQUE(user_id)
);

ALTER TABLE vip_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages vip" ON vip_permissions
  FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users read own permissions" ON vip_permissions
  FOR SELECT TO authenticated USING (user_id = auth.uid());
