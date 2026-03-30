-- Migration: 0ndefender_patent_intelligence
-- Description: Tables for patent intelligence scanning, findings, watchlist, and alerts
-- Author: supabase-db-manager
-- Date: 2026-03-30

-- intel_scans: tracks each scan execution
create table if not exists intel_scans (
  id uuid primary key default gen_random_uuid(),
  scan_type text not null,
  scan_query text not null,
  status text not null default 'pending',
  results_count integer default 0,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- intel_findings: individual results from scans
create table if not exists intel_findings (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid references intel_scans(id) on delete cascade,
  scan_type text not null,
  title text not null,
  summary text not null,
  source_url text,
  source_name text,
  published_date date,
  threat_level text not null default 'low',
  category text not null,
  company_name text,
  company_domain text,
  patent_number text,
  filing_date date,
  overlapping_patents text[],
  overlap_summary text,
  reviewed boolean default false,
  review_status text,
  review_notes text,
  reviewed_by text,
  reviewed_at timestamptz,
  content_hash text unique,
  created_at timestamptz default now()
);

create index if not exists intel_findings_threat_level on intel_findings(threat_level);
create index if not exists intel_findings_reviewed on intel_findings(reviewed);
create index if not exists intel_findings_scan_type on intel_findings(scan_type);
create index if not exists intel_findings_created_at on intel_findings(created_at desc);

-- intel_watchlist: companies/entities to monitor
create table if not exists intel_watchlist (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text,
  category text not null,
  reason text,
  alert_on_any_mention boolean default true,
  last_hit_at timestamptz,
  created_at timestamptz default now()
);

-- Seed watchlist
insert into intel_watchlist (name, domain, category, reason) values
  ('Anthropic', 'anthropic.com', 'mcp_ecosystem', 'MCP protocol creator — any MCP policy changes affect our claims'),
  ('OpenClaw', null, 'competitor', 'Primary direct competitor. Founded by Peter Steinberger. GitHub public Nov 2025.'),
  ('OpenAI', 'openai.com', 'mcp_ecosystem', 'Could implement competing orchestration standard'),
  ('Microsoft', 'microsoft.com', 'potential_acquirer', 'Copilot + MCP integration path. Enterprise buyer profile.'),
  ('Salesforce', 'salesforce.com', 'potential_acquirer', 'Agentforce + MCP = natural fit. CRM integration story.'),
  ('ServiceNow', 'servicenow.com', 'potential_acquirer', 'Workflow automation acquirer history'),
  ('Zapier', 'zapier.com', 'competitor', 'Workflow automation. Could pivot to MCP orchestration.'),
  ('n8n', 'n8n.io', 'competitor', 'Open-source workflow automation. MCP-adjacent.'),
  ('Rippling', 'rippling.com', 'potential_acquirer', 'API orchestration for HR/ops. Acquisition-mode company.'),
  ('HubSpot', 'hubspot.com', 'potential_acquirer', 'CRM + AI tools. Our Add0n marketplace fits their ecosystem.')
on conflict do nothing;

-- intel_alerts: notifications generated from findings
create table if not exists intel_alerts (
  id uuid primary key default gen_random_uuid(),
  finding_id uuid references intel_findings(id) on delete cascade,
  alert_type text not null,
  message text not null,
  read boolean default false,
  read_at timestamptz,
  created_at timestamptz default now()
);

-- RLS
alter table intel_scans enable row level security;
alter table intel_findings enable row level security;
alter table intel_watchlist enable row level security;
alter table intel_alerts enable row level security;

-- Service role full access (admin API routes use service role key)
create policy "service_role_intel_scans" on intel_scans for all using (true) with check (true);
create policy "service_role_intel_findings" on intel_findings for all using (true) with check (true);
create policy "service_role_intel_watchlist" on intel_watchlist for all using (true) with check (true);
create policy "service_role_intel_alerts" on intel_alerts for all using (true) with check (true);
