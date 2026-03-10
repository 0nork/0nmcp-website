-- Brain Training Factory — Self-training AI knowledge accumulation
-- ALL training runs happen OFFLINE in Claude Code (MAX plan).
-- Vercel cron does housekeeping only (prune + milestone checks).

-- Council Knowledge — accumulated high-confidence reasoning
CREATE TABLE IF NOT EXISTS council_knowledge (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain TEXT NOT NULL,
  question TEXT NOT NULL,
  synthesis TEXT NOT NULL,
  composite_score NUMERIC(4,3) NOT NULL CHECK (composite_score >= 0 AND composite_score <= 1),
  persona_votes JSONB DEFAULT '{}',
  source TEXT DEFAULT 'self_training' CHECK (source IN ('self_training', 'user_contribution')),
  tier_generated INT DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '90 days'),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_ck_domain_score ON council_knowledge(domain, composite_score DESC);
CREATE INDEX idx_ck_expires ON council_knowledge(expires_at);
CREATE INDEX idx_ck_source ON council_knowledge(source);
CREATE INDEX idx_ck_tier ON council_knowledge(tier_generated);

-- Full-text search on question + synthesis
ALTER TABLE council_knowledge ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (to_tsvector('english', coalesce(question, '') || ' ' || coalesce(synthesis, ''))) STORED;
CREATE INDEX idx_ck_fts ON council_knowledge USING GIN(fts);

ALTER TABLE council_knowledge ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read knowledge" ON council_knowledge FOR SELECT USING (true);
CREATE POLICY "Service role manages knowledge" ON council_knowledge FOR ALL USING (auth.role() = 'service_role');

-- Training Runs — log of each training session (written by Claude Code offline)
CREATE TABLE IF NOT EXISTS training_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_size INT NOT NULL DEFAULT 0,
  avg_composite_score NUMERIC(4,3),
  entries_added INT DEFAULT 0,
  entries_pruned INT DEFAULT 0,
  duration_ms INT,
  run_type TEXT DEFAULT 'offline' CHECK (run_type IN ('offline', 'manual', 'user_ingest', 'housekeeping')),
  tier_level INT DEFAULT 0,
  milestones_triggered TEXT[] DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tr_created ON training_runs(created_at DESC);
CREATE INDEX idx_tr_type ON training_runs(run_type);

ALTER TABLE training_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read runs" ON training_runs FOR SELECT USING (true);
CREATE POLICY "Service role manages runs" ON training_runs FOR ALL USING (auth.role() = 'service_role');

-- Training Contributions — anonymized user-contributed data (Tier 3+)
CREATE TABLE IF NOT EXISTS training_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_hash TEXT NOT NULL,
  domain TEXT NOT NULL,
  question TEXT,
  synthesis TEXT,
  composite_score NUMERIC(4,3),
  accepted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_tc_user_date ON training_contributions(user_hash, created_at);
CREATE INDEX idx_tc_domain ON training_contributions(domain);

ALTER TABLE training_contributions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated insert contributions" ON training_contributions
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Service role manages contributions" ON training_contributions
  FOR ALL USING (auth.role() = 'service_role');

-- Training Milestones — achievement tracking
CREATE TABLE IF NOT EXISTS training_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_key TEXT UNIQUE NOT NULL,
  reached_at TIMESTAMPTZ DEFAULT now(),
  notified BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_tm_key ON training_milestones(milestone_key);

ALTER TABLE training_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read milestones" ON training_milestones FOR SELECT USING (true);
CREATE POLICY "Service role manages milestones" ON training_milestones
  FOR ALL USING (auth.role() = 'service_role');
