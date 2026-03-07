-- ============================================================
-- Sparks ⚡ Credit System
-- Pre-paid credit economy for 0nMCP platform
-- ============================================================

-- Spark balance per user (single row per user)
create table if not exists public.spark_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  lifetime_earned integer not null default 0,
  lifetime_spent integer not null default 0,
  last_purchase_at timestamptz,
  last_deduction_at timestamptz,
  low_balance_notified_at timestamptz,
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Transaction ledger — every spark movement is logged
create type public.spark_tx_type as enum (
  'purchase',       -- bought via Stripe
  'bonus',          -- signup bonus, referral, promo
  'deduction',      -- consumed by API call / workflow execution
  'refund',         -- reversed deduction
  'expiry',         -- expired sparks (future use)
  'grant'           -- admin grant
);

create table if not exists public.spark_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type public.spark_tx_type not null,
  amount integer not null,
  balance_after integer not null,
  description text not null,
  metadata jsonb default '{}',
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  created_at timestamptz not null default now()
);

-- Spark packs — purchasable bundles
create table if not exists public.spark_packs (
  id text primary key,
  name text not null,
  sparks integer not null,
  price_cents integer not null,
  bonus_pct integer not null default 0,
  stripe_price_id text,
  badge text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Insert default spark packs
insert into public.spark_packs (id, name, sparks, price_cents, bonus_pct, badge, sort_order) values
  ('starter',   'Starter',   50,   500,   0,  '⚡',     1),
  ('builder',   'Builder',   250,  2000,  25, '⚡⚡',   2),
  ('pro',       'Pro',       750,  5000,  50, '⚡⚡⚡', 3),
  ('unlimited', 'Unlimited', 2000, 10000, 100,'🔥',     4)
on conflict (id) do nothing;

-- Indexes
create index if not exists idx_spark_transactions_user on public.spark_transactions(user_id, created_at desc);
create index if not exists idx_spark_transactions_type on public.spark_transactions(type);
create index if not exists idx_spark_transactions_stripe on public.spark_transactions(stripe_payment_intent_id) where stripe_payment_intent_id is not null;
create index if not exists idx_spark_balances_stripe on public.spark_balances(stripe_customer_id) where stripe_customer_id is not null;

-- Updated_at trigger
create or replace function public.update_spark_balance_timestamp()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_spark_balance_updated on public.spark_balances;
create trigger trg_spark_balance_updated
  before update on public.spark_balances
  for each row execute function public.update_spark_balance_timestamp();

-- Give new users 10 free Sparks on signup
create or replace function public.grant_signup_sparks()
returns trigger as $$
begin
  insert into public.spark_balances (user_id, balance, lifetime_earned)
  values (new.id, 10, 10)
  on conflict (user_id) do nothing;

  insert into public.spark_transactions (user_id, type, amount, balance_after, description)
  values (new.id, 'bonus', 10, 10, 'Welcome bonus — 10 free Sparks ⚡');

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert (runs after existing profile trigger)
drop trigger if exists trg_grant_signup_sparks on auth.users;
create trigger trg_grant_signup_sparks
  after insert on auth.users
  for each row execute function public.grant_signup_sparks();

-- RLS
alter table public.spark_balances enable row level security;
alter table public.spark_transactions enable row level security;
alter table public.spark_packs enable row level security;

-- Balances: users see own, service_role manages
create policy "Users can view own spark balance"
  on public.spark_balances for select
  using (auth.uid() = user_id);

create policy "Service role manages spark balances"
  on public.spark_balances for all
  using (auth.role() = 'service_role');

-- Transactions: users see own history
create policy "Users can view own spark transactions"
  on public.spark_transactions for select
  using (auth.uid() = user_id);

create policy "Service role manages spark transactions"
  on public.spark_transactions for all
  using (auth.role() = 'service_role');

-- Packs: public read
create policy "Anyone can view active spark packs"
  on public.spark_packs for select
  using (active = true);

create policy "Service role manages spark packs"
  on public.spark_packs for all
  using (auth.role() = 'service_role');
