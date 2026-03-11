-- web0n.com — Productized Website Building Service
-- Tables for project tracking and client revision requests

-- ==================== web0n_projects ====================
CREATE TABLE IF NOT EXISTS web0n_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'intake',  -- intake → deposit_paid → in_build → review → final_paid → launched
  business_name TEXT NOT NULL,
  business_type TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  website_url TEXT,
  interested_in_google_listing BOOLEAN DEFAULT false,
  google_place_id TEXT,
  google_data JSONB,
  brand_colors JSONB,       -- { primary, secondary, accent }
  logo_url TEXT,
  tagline TEXT,
  services JSONB,            -- array of service names
  pages JSONB DEFAULT '["home","services","contact","booking","pricing"]'::jsonb,
  special_requests TEXT,
  crm_contact_id TEXT,
  crm_location_id TEXT,
  crm_opportunity_id TEXT,
  deposit_invoice_id TEXT,
  final_invoice_id TEXT,
  deposit_paid_at TIMESTAMPTZ,
  final_paid_at TIMESTAMPTZ,
  build_brief JSONB,
  site_url TEXT,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_web0n_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER web0n_projects_updated_at
  BEFORE UPDATE ON web0n_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_web0n_projects_updated_at();

-- RLS
ALTER TABLE web0n_projects ENABLE ROW LEVEL SECURITY;

-- Users can read their own projects
CREATE POLICY "Users can view own projects"
  ON web0n_projects FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own projects
CREATE POLICY "Users can create projects"
  ON web0n_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own projects (limited fields handled at app level)
CREATE POLICY "Users can update own projects"
  ON web0n_projects FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin: full access (check is_admin in profiles)
CREATE POLICY "Admins can do anything with projects"
  ON web0n_projects FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Service role bypass for webhooks
CREATE POLICY "Service role full access to projects"
  ON web0n_projects FOR ALL
  USING (auth.role() = 'service_role');

-- ==================== web0n_revisions ====================
CREATE TABLE IF NOT EXISTS web0n_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES web0n_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',  -- pending → in_progress → resolved
  admin_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE web0n_revisions ENABLE ROW LEVEL SECURITY;

-- Users can view revisions for their projects
CREATE POLICY "Users can view own project revisions"
  ON web0n_revisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM web0n_projects
      WHERE web0n_projects.id = project_id
      AND web0n_projects.user_id = auth.uid()
    )
  );

-- Users can create revisions for their projects
CREATE POLICY "Users can create revisions for own projects"
  ON web0n_revisions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM web0n_projects
      WHERE web0n_projects.id = project_id
      AND web0n_projects.user_id = auth.uid()
    )
  );

-- Admin: full access
CREATE POLICY "Admins can do anything with revisions"
  ON web0n_revisions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Service role bypass
CREATE POLICY "Service role full access to revisions"
  ON web0n_revisions FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes
CREATE INDEX idx_web0n_projects_user_id ON web0n_projects(user_id);
CREATE INDEX idx_web0n_projects_status ON web0n_projects(status);
CREATE INDEX idx_web0n_projects_crm_contact ON web0n_projects(crm_contact_id);
CREATE INDEX idx_web0n_revisions_project_id ON web0n_revisions(project_id);
CREATE INDEX idx_web0n_revisions_status ON web0n_revisions(status);
