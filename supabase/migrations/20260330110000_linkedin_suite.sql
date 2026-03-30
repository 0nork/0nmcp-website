-- LinkedIn Integration Suite
-- Connected accounts, ad accounts, campaigns, creatives, analytics, posts

-- LinkedIn connected accounts
create table if not exists linkedin_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  linkedin_id text not null,
  name text,
  email text,
  headline text,
  profile_url text,
  profile_photo text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  org_ids text[],
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LinkedIn ad accounts
create table if not exists linkedin_ad_accounts (
  id uuid primary key default gen_random_uuid(),
  linkedin_account_id uuid references linkedin_accounts(id) on delete cascade,
  ad_account_id text not null,
  name text,
  status text,
  currency text default 'USD',
  total_budget numeric,
  created_at timestamptz default now()
);

-- LinkedIn campaigns
create table if not exists linkedin_campaigns (
  id uuid primary key default gen_random_uuid(),
  ad_account_id uuid references linkedin_ad_accounts(id) on delete cascade,
  campaign_id text not null,
  name text not null,
  status text default 'DRAFT',
  type text,
  objective text,
  daily_budget numeric,
  total_budget numeric,
  start_date date,
  end_date date,
  targeting jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- LinkedIn creatives / ads
create table if not exists linkedin_creatives (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references linkedin_campaigns(id) on delete cascade,
  creative_id text not null,
  type text,
  status text default 'DRAFT',
  headline text,
  description text,
  destination_url text,
  image_url text,
  call_to_action text,
  created_at timestamptz default now()
);

-- LinkedIn analytics snapshots
create table if not exists linkedin_analytics (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null,
  entity_id text not null,
  date date not null,
  impressions integer default 0,
  clicks integer default 0,
  spend numeric default 0,
  conversions integer default 0,
  engagement_rate numeric,
  ctr numeric,
  cpc numeric,
  cpm numeric,
  leads integer default 0,
  followers_gained integer default 0,
  shares integer default 0,
  comments integer default 0,
  reactions integer default 0,
  raw_data jsonb,
  created_at timestamptz default now(),
  unique(entity_type, entity_id, date)
);

-- LinkedIn scheduled posts
create table if not exists linkedin_posts (
  id uuid primary key default gen_random_uuid(),
  linkedin_account_id uuid references linkedin_accounts(id) on delete cascade,
  author_type text not null default 'member',
  author_id text not null,
  content text not null,
  media_urls text[],
  post_id text,
  status text default 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  engagement jsonb,
  created_at timestamptz default now()
);

-- Indexes
create index if not exists linkedin_analytics_entity on linkedin_analytics(entity_type, entity_id);
create index if not exists linkedin_analytics_date on linkedin_analytics(date desc);
create index if not exists linkedin_posts_status on linkedin_posts(status);
create index if not exists linkedin_campaigns_status on linkedin_campaigns(status);

-- RLS
alter table linkedin_accounts enable row level security;
alter table linkedin_ad_accounts enable row level security;
alter table linkedin_campaigns enable row level security;
alter table linkedin_creatives enable row level security;
alter table linkedin_analytics enable row level security;
alter table linkedin_posts enable row level security;

create policy "service_role_all" on linkedin_accounts for all using (true) with check (true);
create policy "service_role_all" on linkedin_ad_accounts for all using (true) with check (true);
create policy "service_role_all" on linkedin_campaigns for all using (true) with check (true);
create policy "service_role_all" on linkedin_creatives for all using (true) with check (true);
create policy "service_role_all" on linkedin_analytics for all using (true) with check (true);
create policy "service_role_all" on linkedin_posts for all using (true) with check (true);
