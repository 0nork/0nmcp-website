-- ============================================================
-- 0nMCP OAuth 2.0 Server Tables
-- Run: supabase db push
-- ============================================================

-- Registered OAuth clients (Anthropic, Claude Code, etc.)
create table if not exists oauth_clients (
  id              uuid primary key default gen_random_uuid(),
  client_id       text unique not null,
  client_secret   text not null,           -- SHA-256 hashed
  name            text not null,
  redirect_uris   text[] not null,
  allowed_scopes  text[] not null default '{}',
  created_at      timestamptz default now()
);

-- Short-lived authorization codes (10-minute TTL)
create table if not exists oauth_codes (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  client_id    text not null,
  user_id      uuid not null references auth.users(id) on delete cascade,
  redirect_uri text not null,
  scopes       text[] not null,
  expires_at   timestamptz not null,
  used         boolean default false,
  created_at   timestamptz default now()
);

-- Access + refresh tokens
create table if not exists oauth_tokens (
  id                 uuid primary key default gen_random_uuid(),
  access_token       text unique not null,
  refresh_token      text unique,
  client_id          text not null,
  user_id            uuid not null references auth.users(id) on delete cascade,
  scopes             text[] not null,
  access_expires_at  timestamptz not null,
  refresh_expires_at timestamptz,
  revoked            boolean default false,
  created_at         timestamptz default now()
);

-- Indexes for performance
create index if not exists oauth_codes_code_idx        on oauth_codes(code);
create index if not exists oauth_codes_expires_idx     on oauth_codes(expires_at);
create index if not exists oauth_tokens_access_idx     on oauth_tokens(access_token);
create index if not exists oauth_tokens_refresh_idx    on oauth_tokens(refresh_token);
create index if not exists oauth_tokens_user_idx       on oauth_tokens(user_id);

-- RLS: service role only (all OAuth logic runs server-side)
alter table oauth_clients enable row level security;
alter table oauth_codes    enable row level security;
alter table oauth_tokens   enable row level security;

-- No public access — server-side only via service_role key
create policy "service role only" on oauth_clients for all using (false);
create policy "service role only" on oauth_codes    for all using (false);
create policy "service role only" on oauth_tokens   for all using (false);

-- ============================================================
-- Seed: Anthropic as a registered OAuth client
-- Run after migration. Replace CLIENT_SECRET with a real hash:
--   node -e "const c=require('crypto');console.log(c.createHash('sha256').update('YOUR_SECRET').digest('hex'))"
-- ============================================================
insert into oauth_clients (client_id, client_secret, name, redirect_uris, allowed_scopes)
values (
  'anthropic-claude',
  '3ee5175c905e6b9c3d3b4e7fd04abe962508b0473ffb6cbeab523d0f1385b2b0',
  'Anthropic Claude',
  array[
    'https://claude.ai/api/mcp/auth_callback',
    'https://claude.com/api/mcp/auth_callback',
    'http://localhost:6274/oauth/callback',
    'http://localhost:6274/oauth/callback/debug'
  ],
  array[
    'vault:read',
    'vault:write',
    'sparks:read',
    'sparks:spend',
    'workflows:execute',
    'brain:read',
    'brain:contribute'
  ]
) on conflict (client_id) do nothing;

-- ============================================================
-- Cleanup job: auto-expire old codes + tokens (via pg_cron)
-- Enable pg_cron in Supabase Dashboard → Database → Extensions
-- ============================================================
-- select cron.schedule(
--   'cleanup-oauth',
--   '0 * * * *',
--   $$
--     delete from oauth_codes  where expires_at < now();
--     delete from oauth_tokens where access_expires_at < now() - interval '7 days';
--   $$
-- );
