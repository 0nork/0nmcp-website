-- ============================================================
-- Add0n Storefront Schema
-- marketplace.rocketclients.com
-- ============================================================

-- Location install registry
-- One row per installed CRM location. Mirrors crm_tokens but storefront-facing.

create table if not exists public.add0n_locations (
  id                uuid        primary key default gen_random_uuid(),
  location_id       text        not null unique,
  company_id        text        not null,
  agency_name       text,
  plan              text        not null default 'standard',  -- 'standard' | 'pro' | 'enterprise'
  is_active         boolean     not null default true,
  installed_at      timestamptz not null default now(),
  last_seen_at      timestamptz not null default now(),
  meta              jsonb                  default '{}'
);

create index if not exists add0n_locations_location_id_idx
  on public.add0n_locations (location_id) where is_active = true;

alter table public.add0n_locations enable row level security;
create policy "deny all anon" on public.add0n_locations
  as restrictive for all to anon using (false);

-- Product listings
-- Central catalog. Adding a row here makes it appear in every installed storefront.

create table if not exists public.add0n_listings (
  id                uuid        primary key default gen_random_uuid(),
  slug              text        not null unique,
  title             text        not null,
  tagline           text,
  description       text,
  category          text        not null default 'Extensions',
  price_cents       integer     not null default 0,  -- 0 = free/included
  stripe_product_id text,
  stripe_price_id   text,
  action_key        text,       -- maps to trigger route action field
  is_active         boolean     not null default true,
  is_featured       boolean     not null default false,
  sort_order        integer     not null default 0,
  icon_emoji        text        not null default '\u26A1',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.add0n_listings enable row level security;
create policy "deny all anon" on public.add0n_listings
  as restrictive for all to anon using (false);

-- Seed initial listings
insert into public.add0n_listings
  (slug, title, tagline, description, category, price_cents, stripe_product_id, stripe_price_id, action_key, is_active, is_featured, sort_order, icon_emoji)
values
  (
    'web0n-site-builder',
    'web0n Site Builder',
    'AI-generated 5-page website, deployed in minutes',
    'Provide your business name, address, and brand color. 0nMCP AI generates Home, Services, About, Booking, and Contact pages and deploys them directly to your CRM funnel — fully editable, no coding required.',
    'Extensions',
    149700,   -- $1,497 in cents
    'prod_UA5cvUVlD9QKIi',
    'price_1TBlRrHThmAuKVQMeswwujpo',
    'build_website',
    true, true, 10,
    E'\U0001F310'
  ),
  (
    'workflow-builder',
    'Automation Workflow Builder',
    'AI-generated CRM automation sequences on demand',
    'Describe your automation goal. 0nMCP AI builds email sequences, SMS drips, trigger chains, and appointment flows — deployed directly to your CRM location.',
    'Automation',
    49700,    -- $497
    null, null,
    'build_workflow',
    false, false, 20,
    E'\u2699\uFE0F'
  ),
  (
    'funnel-builder',
    'Funnel Builder',
    'Multi-step funnels with order forms and upsell pages',
    'AI builds complete multi-step funnels including lead capture, order forms, upsell pages, and membership areas — all deployed to your CRM location.',
    'Extensions',
    49700,
    null, null,
    'build_funnel',
    false, false, 30,
    E'\U0001F500'
  ),
  (
    'pipeline-builder',
    'Pipeline Builder',
    'Custom CRM pipelines with stages, fields, and win conditions',
    'Define your sales process in plain language. 0nMCP AI creates your pipeline stages, custom fields, win conditions, and reporting hooks.',
    'Automation',
    9700,     -- $97
    null, null,
    'build_pipeline',
    false, false, 40,
    E'\U0001F4CA'
  ),
  (
    'snapshot-deploy',
    'Snapshot Deploy',
    'Full sub-account configuration deployed instantly',
    'Deploy a complete, pre-configured CRM sub-account setup including pipelines, workflows, funnels, calendars, and custom fields in a single command.',
    'Extensions',
    49700,
    null, null,
    'deploy_snapshot',
    false, false, 50,
    E'\U0001F4E6'
  )
on conflict (slug) do nothing;

-- Purchases
-- Per-location purchase records. A row here unlocks the capability.

create table if not exists public.add0n_purchases (
  id                uuid        primary key default gen_random_uuid(),
  location_id       text        not null,
  listing_id        uuid        not null references public.add0n_listings(id),
  stripe_session_id text,
  stripe_payment_id text,
  amount_cents      integer     not null default 0,
  status            text        not null default 'complete',  -- 'pending' | 'complete' | 'refunded'
  purchased_at      timestamptz not null default now(),
  meta              jsonb                  default '{}'
);

create unique index if not exists add0n_purchases_location_listing_idx
  on public.add0n_purchases (location_id, listing_id)
  where status = 'complete';

create index if not exists add0n_purchases_location_id_idx
  on public.add0n_purchases (location_id);

alter table public.add0n_purchases enable row level security;
create policy "deny all anon" on public.add0n_purchases
  as restrictive for all to anon using (false);

-- Build history
-- Append-only log of every triggered build per location.

create table if not exists public.add0n_build_history (
  id                uuid        primary key default gen_random_uuid(),
  location_id       text        not null,
  listing_slug      text        not null,
  action            text        not null,
  status            text        not null default 'triggered', -- 'triggered'|'complete'|'fallback'|'error'
  conversation_id   text,
  contact_id        text,
  business_name     text,
  result_payload    jsonb,
  triggered_at      timestamptz not null default now(),
  completed_at      timestamptz
);

create index if not exists add0n_build_history_location_idx
  on public.add0n_build_history (location_id, triggered_at desc);

alter table public.add0n_build_history enable row level security;
create policy "deny all anon" on public.add0n_build_history
  as restrictive for all to anon using (false);

-- Triggers for updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists add0n_listings_updated_at on public.add0n_listings;
create trigger add0n_listings_updated_at
  before update on public.add0n_listings
  for each row execute function public.set_updated_at();
