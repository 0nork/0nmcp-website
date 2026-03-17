-- ============================================================
-- Add0n — CRM OAuth Token Store
-- marketplace.rocketclients.com
-- Paste into Supabase dashboard → SQL Editor
-- Project: pwujhhmlrtxjmjzyttwn
-- ============================================================

-- Per-location token storage (one row per installed sub-location)
create table if not exists public.crm_tokens (
  id                uuid        primary key default gen_random_uuid(),

  -- CRM identifiers
  location_id       text        not null unique,
  company_id        text        not null,

  -- Tokens — AES-256-GCM encrypted at application layer before insert
  access_token      text        not null,
  refresh_token     text        not null,
  token_type        text        not null default 'Bearer',

  -- Expiry
  expires_at        timestamptz not null,

  -- Scopes granted at install time
  scopes            text[]      not null default '{}',

  -- Meta
  app_version       text        not null default '1.0',
  installed_by_user text,
  is_active         boolean     not null default true,

  -- Timestamps
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Hot-path index for trigger route lookups
create index if not exists crm_tokens_location_id_idx
  on public.crm_tokens (location_id)
  where is_active = true;

create index if not exists crm_tokens_company_id_idx
  on public.crm_tokens (company_id);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists crm_tokens_set_updated_at on public.crm_tokens;
create trigger crm_tokens_set_updated_at
  before update on public.crm_tokens
  for each row execute function public.set_updated_at();

-- ── Row-Level Security ────────────────────────────────────────────────────────
-- Application code must use SUPABASE_SERVICE_ROLE_KEY only.
-- Service role bypasses RLS automatically.

alter table public.crm_tokens enable row level security;

create policy "deny all anon" on public.crm_tokens
  as restrictive for all to anon using (false);

-- ── Install event audit log ───────────────────────────────────────────────────
-- Append-only trail: installs, uninstalls, token refreshes, errors

create table if not exists public.crm_install_events (
  id            uuid        primary key default gen_random_uuid(),
  location_id   text        not null,
  company_id    text,
  event_type    text        not null, -- 'install' | 'uninstall' | 'token_refresh' | 'install_error'
  payload       jsonb,
  error         text,
  created_at    timestamptz not null default now()
);

create index if not exists crm_install_events_location_idx
  on public.crm_install_events (location_id, created_at desc);

alter table public.crm_install_events enable row level security;

create policy "deny all anon" on public.crm_install_events
  as restrictive for all to anon using (false);

-- ── Comments ──────────────────────────────────────────────────────────────────
comment on table public.crm_tokens is
  'Per-location OAuth tokens issued when agencies install Add0n from marketplace.rocketclients.com.';

comment on column public.crm_tokens.access_token is
  'AES-256-GCM encrypted at application layer. Decrypt with CRM_TOKEN_ENCRYPTION_KEY.';

comment on column public.crm_tokens.refresh_token is
  'AES-256-GCM encrypted at application layer.';
