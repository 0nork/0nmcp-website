-- 0nFlow v0.1 — universal scheduled workflow runner
--
-- Generalizes the SXO email_sequence_queue pattern into a reusable engine
-- that powers every RocketOpp product. Steps are executed by /api/cron/flows
-- (every minute) and dispatched into 0nMCP tools (CRM email, SMS, Slack,
-- tag-add, generic webhook, branch, wait).
--
-- Design:
--   flows               → reusable flow definition (template)
--   flow_enrollments    → one row per (flow, contact) pairing
--   flow_steps          → individual scheduled step rows the cron drains
--
-- v0.1 materializes ALL steps on enrollment (linear). v0.2 will move to
-- next-step-only materialization to support branching + dynamic flows.

create table if not exists public.flows (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  description     text,
  owner_email     text,
  owner_product   text,                              -- 'sxowebsite' | '0ncore' | 'rocketopp' | 'rocketclients' | etc.
  active          boolean not null default true,
  steps           jsonb not null,                    -- array of step templates
  default_provider text default 'crm',               -- email provider preference
  default_location_id text,                          -- CRM sub-location for sends
  metadata        jsonb default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists public.flow_enrollments (
  id              uuid primary key default gen_random_uuid(),
  flow_id         uuid not null references public.flows(id) on delete cascade,
  contact_id      text,                              -- CRM contact id (nullable on create)
  contact_email   text not null,
  contact_data    jsonb default '{}'::jsonb,         -- domain, score, scanId, customFields …
  status          text not null default 'active'
                  check (status in ('active','paused','completed','cancelled')),
  current_step    int not null default 0,
  enrolled_at     timestamptz not null default now(),
  completed_at    timestamptz,
  cancelled_at    timestamptz,
  metadata        jsonb default '{}'::jsonb
);

create table if not exists public.flow_steps (
  id              uuid primary key default gen_random_uuid(),
  enrollment_id   uuid not null references public.flow_enrollments(id) on delete cascade,
  flow_id         uuid not null references public.flows(id),
  step_index      int not null,
  action          text not null,                     -- 'email'|'sms'|'slack'|'tag_add'|'webhook'|'wait'
  params          jsonb not null,                    -- action-specific input
  scheduled_at    timestamptz not null,
  status          text not null default 'pending'
                  check (status in ('pending','running','sent','failed','skipped','cancelled')),
  attempts        int not null default 0,
  last_error      text,
  result          jsonb,
  sent_at         timestamptz,
  created_at      timestamptz not null default now()
);

create index if not exists flow_steps_drain_idx
  on public.flow_steps (status, scheduled_at)
  where status = 'pending';

create index if not exists flow_steps_enrollment_idx
  on public.flow_steps (enrollment_id, step_index);

create index if not exists flow_enrollments_flow_idx
  on public.flow_enrollments (flow_id, status);

create index if not exists flow_enrollments_email_idx
  on public.flow_enrollments (contact_email);

-- updated_at trigger for flows
create or replace function public.flows_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists flows_updated_at_trg on public.flows;
create trigger flows_updated_at_trg
  before update on public.flows
  for each row execute function public.flows_set_updated_at();

-- RLS: locked by default; service role only (cron + API)
alter table public.flows            enable row level security;
alter table public.flow_enrollments enable row level security;
alter table public.flow_steps       enable row level security;

-- No public policies in v0.1 — only service-role access via the API.
