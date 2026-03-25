-- ============================================================
-- 0nMCP Project Manager — Companies → Projects → Tasks
-- Simple, clean, universal fields
-- ============================================================

-- Companies
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  website TEXT,
  industry TEXT,
  color TEXT DEFAULT '#7ed957',
  logo_url TEXT,
  crm_location_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "companies_own_read" ON companies FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "companies_own_insert" ON companies FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "companies_own_update" ON companies FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "companies_own_delete" ON companies FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_companies_user ON companies(user_id);

-- Projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  color TEXT DEFAULT '#00d4ff',
  budget NUMERIC(10,2),
  due_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_own_read" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_own_insert" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_own_update" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_own_delete" ON projects FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_company ON projects(company_id);

-- Tasks
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date DATE,
  assigned_to TEXT,
  tags TEXT[] DEFAULT '{}',
  sort_order INT DEFAULT 0,
  completed_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tasks_own_read" ON tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_own_insert" ON tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_own_update" ON tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_own_delete" ON tasks FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_user ON tasks(user_id);

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_companies_updated BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  CREATE TRIGGER trg_tasks_updated BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
