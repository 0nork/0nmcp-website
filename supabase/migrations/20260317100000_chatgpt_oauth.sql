-- ============================================================
-- ChatGPT Apps SDK OAuth Tables
-- 0nmcp.com — Supabase project pwujhhmlrtxjmjzyttwn
-- Paste into: https://supabase.com/dashboard/project/pwujhhmlrtxjmjzyttwn/sql
-- ============================================================

-- ── DCR client registrations ──────────────────────────────────────────────────
-- One row per ChatGPT client registration (new client_id each connection).

create table if not exists public.chatgpt_oauth_clients (
  id            uuid        primary key default gen_random_uuid(),
  client_id     text        not null unique,
  redirect_uris text[]      not null default '{}',
  grant_types   text[]      not null default '{"authorization_code"}',
  scope         text        not null default '',
  client_name   text,
  client_uri    text,
  issued_at     bigint      not null,
  expires_at    bigint      not null,
  created_at    timestamptz not null default now()
);

create index if not exists chatgpt_oauth_clients_client_id_idx
  on public.chatgpt_oauth_clients (client_id);

alter table public.chatgpt_oauth_clients enable row level security;
create policy "deny all anon" on public.chatgpt_oauth_clients
  as restrictive for all to anon using (false);

-- ── Authorization requests ────────────────────────────────────────────────────
-- Tracks the code grant flow — pending until user logs in, authorized after.

create table if not exists public.chatgpt_auth_requests (
  id             uuid        primary key default gen_random_uuid(),
  client_id      text        not null,
  redirect_uri   text        not null,
  state          text,
  code_challenge text        not null,
  scope          text        not null default '',
  auth_code      text        not null unique,
  -- Set after user authenticates on 0nmcp.com consent page
  user_id        text,
  status         text        not null default 'pending',
  -- 'pending' → 'authorized' → 'used' | 'expired'
  expires_at     timestamptz not null,
  created_at     timestamptz not null default now()
);

create index if not exists chatgpt_auth_requests_auth_code_idx
  on public.chatgpt_auth_requests (auth_code);

create index if not exists chatgpt_auth_requests_status_idx
  on public.chatgpt_auth_requests (status, expires_at);

alter table public.chatgpt_auth_requests enable row level security;
create policy "deny all anon" on public.chatgpt_auth_requests
  as restrictive for all to anon using (false);

-- ── Refresh tokens ────────────────────────────────────────────────────────────

create table if not exists public.chatgpt_refresh_tokens (
  id          uuid        primary key default gen_random_uuid(),
  token       text        not null unique,
  user_id     text        not null,
  client_id   text        not null,
  scope       text        not null default '',
  is_revoked  boolean     not null default false,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists chatgpt_refresh_tokens_token_idx
  on public.chatgpt_refresh_tokens (token) where is_revoked = false;

create index if not exists chatgpt_refresh_tokens_user_id_idx
  on public.chatgpt_refresh_tokens (user_id);

alter table public.chatgpt_refresh_tokens enable row level security;
create policy "deny all anon" on public.chatgpt_refresh_tokens
  as restrictive for all to anon using (false);

-- ── Build event log (ChatGPT source) ─────────────────────────────────────────
-- Tracks every tool call from the ChatGPT app for analytics + billing.

create table if not exists public.chatgpt_tool_calls (
  id            uuid        primary key default gen_random_uuid(),
  user_id       text        not null,
  tool_name     text        not null,
  input_args    jsonb,
  result_status text        not null default 'success',  -- 'success' | 'error' | 'insufficient_sparks'
  sparks_used   integer     not null default 0,
  called_at     timestamptz not null default now()
);

create index if not exists chatgpt_tool_calls_user_id_idx
  on public.chatgpt_tool_calls (user_id, called_at desc);

alter table public.chatgpt_tool_calls enable row level security;
create policy "deny all anon" on public.chatgpt_tool_calls
  as restrictive for all to anon using (false);

-- ── Comments ──────────────────────────────────────────────────────────────────
comment on table public.chatgpt_oauth_clients is
  'Dynamic Client Registrations from ChatGPT. One per user session (per MCP spec DCR).';
comment on table public.chatgpt_auth_requests is
  'OAuth 2.1 authorization code requests. Pending until user authenticates at 0nmcp.com/auth/chatgpt-consent.';
