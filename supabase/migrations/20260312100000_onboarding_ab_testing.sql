-- ╔══════════════════════════════════════════════════════════════╗
-- ║  Onboarding A/B Testing System                              ║
-- ║  Experiments, variants, assignments, event tracking          ║
-- ╚══════════════════════════════════════════════════════════════╝

-- ── 1. Experiments ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_experiments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ── 2. Variants ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  experiment_id UUID NOT NULL REFERENCES onboarding_experiments(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_control BOOLEAN DEFAULT false,
  weight INT NOT NULL DEFAULT 50,
  step_order JSONB NOT NULL DEFAULT '["welcome","profile","tools","community","launch"]',
  step_config JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- step_config example:
-- {
--   "tools": { "skip": true },
--   "payment": { "skip": true },
--   "profile": { "simulate": true, "title": "Quick Setup" },
--   "community": { "preselect": ["general"] }
-- }

-- ── 3. Assignments (user → variant) ────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID NOT NULL REFERENCES onboarding_experiments(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES onboarding_variants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, experiment_id)
);

-- ── 4. Events (step-level tracking) ─────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  experiment_id UUID REFERENCES onboarding_experiments(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES onboarding_variants(id) ON DELETE SET NULL,
  step TEXT NOT NULL,
  event_type TEXT NOT NULL
    CHECK (event_type IN ('view', 'complete', 'skip', 'drop_off', 'error', 'interaction')),
  metadata JSONB DEFAULT '{}',
  duration_ms INT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── 5. Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_ob_events_user ON onboarding_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ob_events_experiment ON onboarding_events(experiment_id) WHERE experiment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ob_events_step ON onboarding_events(step, event_type);
CREATE INDEX IF NOT EXISTS idx_ob_events_created ON onboarding_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ob_assignments_experiment ON onboarding_assignments(experiment_id);
CREATE INDEX IF NOT EXISTS idx_ob_variants_experiment ON onboarding_variants(experiment_id);

-- ── 6. RLS ──────────────────────────────────────────────────
ALTER TABLE onboarding_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

-- Experiments: anyone can read (needed during onboarding), service_role manages
CREATE POLICY "read_experiments" ON onboarding_experiments
  FOR SELECT TO authenticated USING (true);

-- Variants: anyone can read
CREATE POLICY "read_variants" ON onboarding_variants
  FOR SELECT TO authenticated USING (true);

-- Assignments: users read own, service_role inserts
CREATE POLICY "read_own_assignments" ON onboarding_assignments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "insert_own_assignments" ON onboarding_assignments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Events: users insert + read own
CREATE POLICY "insert_own_events" ON onboarding_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "read_own_events" ON onboarding_events
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ── 7. Seed default experiment ──────────────────────────────
-- Control: full 6-step flow (current)
-- Variant B: skip payment + simplified tools step
-- Variant C: 3-step fast track (welcome → profile → launch)

INSERT INTO onboarding_experiments (id, name, description, status)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Default Flow Optimization',
  'Test removing payment step and simplifying tools step vs current 6-step flow',
  'active'
) ON CONFLICT DO NOTHING;

INSERT INTO onboarding_variants (id, experiment_id, name, is_control, weight, step_order, step_config)
VALUES
  -- Control: current full flow
  ('b0000000-0000-0000-0000-000000000001',
   'a0000000-0000-0000-0000-000000000001',
   'Control (Full Flow)', true, 34,
   '["welcome","profile","tools","payment","community","launch"]',
   '{}'),
  -- Variant B: skip payment, simplify tools
  ('b0000000-0000-0000-0000-000000000002',
   'a0000000-0000-0000-0000-000000000001',
   'No Payment + Simple Tools', false, 33,
   '["welcome","profile","tools","community","launch"]',
   '{"tools": {"title": "Connect a Service (Optional)", "subtitle": "You can always add these later from your Vault", "allowSkip": true}, "payment": {"skip": true}}'),
  -- Variant C: fast track (3 steps)
  ('b0000000-0000-0000-0000-000000000003',
   'a0000000-0000-0000-0000-000000000001',
   'Fast Track (3 Steps)', false, 33,
   '["welcome","profile","launch"]',
   '{"tools": {"skip": true}, "payment": {"skip": true}, "community": {"skip": true}}')
ON CONFLICT DO NOTHING;
