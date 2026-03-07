-- SXO Engine Tables
-- Powers the SXO page-builder platform on 0nmcp.com
-- Consumed by sxowebsite.com via API

-- Industry formula templates
CREATE TABLE IF NOT EXISTS sxo_formulas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  blocks JSONB NOT NULL DEFAULT '[]',
  problem_solutions JSONB NOT NULL DEFAULT '[]',
  schema_templates JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sxo_formulas_industry ON sxo_formulas(industry) WHERE is_default = true;

-- Registered sites being optimized
CREATE TABLE IF NOT EXISTS sxo_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  domain TEXT NOT NULL,
  brand TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'business',
  services TEXT[] DEFAULT '{}',
  locations TEXT[] DEFAULT '{}',
  cta TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#7ed957',
  settings JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  last_audit_at TIMESTAMPTZ,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sxo_sites_domain ON sxo_sites(domain);
CREATE INDEX IF NOT EXISTS idx_sxo_sites_user ON sxo_sites(user_id);

-- Generated pages with content blocks + schema + metadata
CREATE TABLE IF NOT EXISTS sxo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sxo_sites(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  page_type TEXT NOT NULL CHECK (page_type IN ('entity', 'service', 'problem_solution', 'authority', 'location', 'portfolio', 'faq', 'city')),
  blocks JSONB NOT NULL DEFAULT '[]',
  markdown TEXT,
  schema_json JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  internal_links JSONB DEFAULT '[]',
  sxo_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_sxo_pages_site_slug ON sxo_pages(site_id, slug);
CREATE INDEX IF NOT EXISTS idx_sxo_pages_type ON sxo_pages(page_type);
CREATE INDEX IF NOT EXISTS idx_sxo_pages_status ON sxo_pages(status);

-- Website audit results
CREATE TABLE IF NOT EXISTS sxo_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sxo_sites(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  domain TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  grade TEXT NOT NULL DEFAULT 'F',
  categories JSONB NOT NULL DEFAULT '{}',
  recommendations JSONB NOT NULL DEFAULT '[]',
  raw_data JSONB DEFAULT '{}',
  pages_analyzed INTEGER DEFAULT 0,
  issues_found INTEGER DEFAULT 0,
  opportunities INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sxo_audits_site ON sxo_audits(site_id);
CREATE INDEX IF NOT EXISTS idx_sxo_audits_domain ON sxo_audits(domain);
CREATE INDEX IF NOT EXISTS idx_sxo_audits_created ON sxo_audits(created_at DESC);

-- Audit category scores (normalized per-category breakdown)
-- Categories: technical_seo, content_quality, schema_markup, mobile, performance, authority, local_seo
CREATE TABLE IF NOT EXISTS sxo_audit_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_id UUID REFERENCES sxo_audits(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  max_score INTEGER NOT NULL DEFAULT 100,
  findings JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sxo_audit_cats ON sxo_audit_categories(audit_id);

-- Insert default industry formulas
INSERT INTO sxo_formulas (industry, name, description, is_default, blocks, problem_solutions) VALUES
(
  'contractor',
  'Contractor SXO Formula',
  'Optimized for home service contractors, hardscape, landscaping, HVAC, plumbing, electrical',
  true,
  '[
    {"type": "entity", "required": true, "description": "Business identity and service area"},
    {"type": "service_cluster", "required": true, "description": "Primary service with related services and applications"},
    {"type": "problem_solution", "required": true, "description": "Customer pain points with professional solutions"},
    {"type": "authority", "required": true, "description": "Credentials, manufacturers, certifications"},
    {"type": "location", "required": true, "description": "Natural location signals and service areas"},
    {"type": "portfolio", "required": false, "description": "Project case studies with materials and outcomes"},
    {"type": "cta", "required": true, "description": "Free estimate, quote request, site visit scheduling"}
  ]'::jsonb,
  '[
    {"problem": "Aging outdoor spaces reducing curb appeal", "solution": "Professional hardscape renovation", "outcome": "Dramatically improved property value"},
    {"problem": "Poor yard drainage causing water damage", "solution": "Engineered grading and drainage", "outcome": "Long-term water control and foundation protection"},
    {"problem": "Crumbling retaining walls and erosion", "solution": "Engineered retaining wall systems", "outcome": "Stable structures built to last decades"},
    {"problem": "Unsafe or outdated walkways and steps", "solution": "Professional paver installation", "outcome": "Safe, attractive, ADA-compliant pathways"},
    {"problem": "Lack of usable outdoor living space", "solution": "Custom patio and outdoor kitchen design", "outcome": "Extended living area that increases home value"}
  ]'::jsonb
),
(
  'saas',
  'SaaS SXO Formula',
  'Optimized for software companies, AI tools, B2B platforms',
  true,
  '[
    {"type": "entity", "required": true, "description": "Product identity and value proposition"},
    {"type": "service_cluster", "required": true, "description": "Core features with use cases and integrations"},
    {"type": "problem_solution", "required": true, "description": "Business pain points solved by the product"},
    {"type": "authority", "required": true, "description": "Security certs, uptime, customer logos, case studies"},
    {"type": "location", "required": false, "description": "Markets served, compliance regions"},
    {"type": "portfolio", "required": true, "description": "Customer success stories with metrics"},
    {"type": "cta", "required": true, "description": "Free trial, demo request, pricing page"}
  ]'::jsonb,
  '[
    {"problem": "Manual processes eating up team hours", "solution": "Workflow automation and AI integration", "outcome": "Hours saved per week with fewer errors"},
    {"problem": "Scattered tools with no central dashboard", "solution": "Unified platform with single sign-on", "outcome": "One place to manage everything"},
    {"problem": "Losing leads due to slow follow-up", "solution": "Automated lead capture and instant response", "outcome": "Higher conversion rates"},
    {"problem": "No visibility into team performance", "solution": "Real-time analytics and reporting", "outcome": "Data-driven decisions and accountability"},
    {"problem": "Scaling bottlenecks as team grows", "solution": "Enterprise-grade infrastructure with auto-scaling", "outcome": "Seamless growth without re-platforming"}
  ]'::jsonb
),
(
  'agency',
  'Agency SXO Formula',
  'Optimized for marketing agencies, web design, SEO firms',
  true,
  '[
    {"type": "entity", "required": true, "description": "Agency identity and specializations"},
    {"type": "service_cluster", "required": true, "description": "Service offerings with deliverables and timelines"},
    {"type": "problem_solution", "required": true, "description": "Client challenges with proven methodologies"},
    {"type": "authority", "required": true, "description": "Awards, certifications, partner badges, team bios"},
    {"type": "location", "required": true, "description": "Markets served, remote capabilities"},
    {"type": "portfolio", "required": true, "description": "Case studies with before/after metrics"},
    {"type": "cta", "required": true, "description": "Free audit, strategy call, proposal request"}
  ]'::jsonb,
  '[
    {"problem": "Not ranking in local search results", "solution": "Comprehensive local SEO and content strategy", "outcome": "Top-3 rankings for target keywords within 90 days"},
    {"problem": "Low website conversion rates", "solution": "Conversion rate optimization and UX redesign", "outcome": "Measurable increase in leads and revenue"},
    {"problem": "Inconsistent brand presence online", "solution": "Unified brand strategy across all channels", "outcome": "Stronger recognition and customer trust"},
    {"problem": "Wasting ad budget with poor targeting", "solution": "Data-driven paid media management", "outcome": "Lower cost per acquisition, higher ROAS"},
    {"problem": "No content strategy driving organic traffic", "solution": "SEO content engine with editorial calendar", "outcome": "Compounding organic traffic growth"}
  ]'::jsonb
),
(
  'ecommerce',
  'E-Commerce SXO Formula',
  'Optimized for online stores, DTC brands, marketplaces',
  true,
  '[
    {"type": "entity", "required": true, "description": "Brand story and product categories"},
    {"type": "service_cluster", "required": true, "description": "Product lines with features and benefits"},
    {"type": "problem_solution", "required": true, "description": "Customer needs solved by products"},
    {"type": "authority", "required": true, "description": "Reviews, press mentions, certifications"},
    {"type": "location", "required": false, "description": "Shipping regions, fulfillment centers"},
    {"type": "portfolio", "required": true, "description": "Customer photos, unboxing, testimonials"},
    {"type": "cta", "required": true, "description": "Shop now, free shipping threshold, newsletter signup"}
  ]'::jsonb,
  '[
    {"problem": "Products not appearing in shopping searches", "solution": "Product schema markup and feed optimization", "outcome": "Higher visibility in Google Shopping and AI answers"},
    {"problem": "High cart abandonment rates", "solution": "Checkout optimization and retargeting flows", "outcome": "Recovered revenue and lower abandonment"},
    {"problem": "Low repeat purchase rates", "solution": "Email/SMS loyalty and retention campaigns", "outcome": "Higher customer lifetime value"},
    {"problem": "Poor mobile shopping experience", "solution": "Mobile-first UX with accelerated checkout", "outcome": "Increased mobile conversion rate"},
    {"problem": "No social proof driving purchases", "solution": "UGC collection and review integration", "outcome": "Higher trust and conversion from new visitors"}
  ]'::jsonb
),
(
  'realestate',
  'Real Estate SXO Formula',
  'Optimized for realtors, brokerages, property management',
  true,
  '[
    {"type": "entity", "required": true, "description": "Agent/brokerage identity and specializations"},
    {"type": "service_cluster", "required": true, "description": "Buying, selling, property management services"},
    {"type": "problem_solution", "required": true, "description": "Buyer/seller pain points with expert solutions"},
    {"type": "authority", "required": true, "description": "Licenses, awards, transaction volume, testimonials"},
    {"type": "location", "required": true, "description": "Neighborhoods, school districts, market data"},
    {"type": "portfolio", "required": true, "description": "Recent sales, listings, market reports"},
    {"type": "cta", "required": true, "description": "Free home valuation, schedule showing, market report"}
  ]'::jsonb,
  '[
    {"problem": "Home not selling after months on market", "solution": "Strategic pricing and professional marketing", "outcome": "Faster sale at optimal price"},
    {"problem": "First-time buyer overwhelmed by process", "solution": "Step-by-step buyer guidance and pre-approval help", "outcome": "Confident purchase with no surprises"},
    {"problem": "Not sure what a home is actually worth", "solution": "Comparative market analysis with local expertise", "outcome": "Accurate valuation backed by data"},
    {"problem": "Rental property management headaches", "solution": "Full-service property management", "outcome": "Passive income without the stress"},
    {"problem": "Missing out on off-market opportunities", "solution": "Exclusive network and pocket listing access", "outcome": "First access to best deals before they list"}
  ]'::jsonb
);

-- Enable RLS
ALTER TABLE sxo_formulas ENABLE ROW LEVEL SECURITY;
ALTER TABLE sxo_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sxo_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sxo_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sxo_audit_categories ENABLE ROW LEVEL SECURITY;

-- Formulas are public read
CREATE POLICY "sxo_formulas_public_read" ON sxo_formulas FOR SELECT USING (true);

-- Sites, pages, audits are user-owned
CREATE POLICY "sxo_sites_owner" ON sxo_sites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "sxo_sites_service" ON sxo_sites FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "sxo_pages_owner" ON sxo_pages FOR ALL
  USING (site_id IN (SELECT id FROM sxo_sites WHERE user_id = auth.uid()));
CREATE POLICY "sxo_pages_service" ON sxo_pages FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "sxo_audits_owner" ON sxo_audits FOR ALL
  USING (site_id IN (SELECT id FROM sxo_sites WHERE user_id = auth.uid()));
CREATE POLICY "sxo_audits_service" ON sxo_audits FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "sxo_audits_public_insert" ON sxo_audits FOR INSERT WITH CHECK (site_id IS NULL);

CREATE POLICY "sxo_audit_cats_owner" ON sxo_audit_categories FOR ALL
  USING (audit_id IN (SELECT id FROM sxo_audits WHERE site_id IN (SELECT id FROM sxo_sites WHERE user_id = auth.uid())));
CREATE POLICY "sxo_audit_cats_service" ON sxo_audit_categories FOR ALL USING (auth.role() = 'service_role');
