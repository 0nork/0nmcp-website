-- Fix Sparks Free Tier — Signup gets 50 Sparks (was 10)
-- BYOK users get AI operations for free (handled in app code)
-- Free store downloads cost 0 Sparks (handled in app code)

-- 1. Update signup trigger to grant 50 Sparks instead of 10
create or replace function public.grant_signup_sparks()
returns trigger as $$
begin
  insert into public.spark_balances (user_id, balance, lifetime_earned)
  values (new.id, 50, 50)
  on conflict (user_id) do nothing;

  insert into public.spark_transactions (user_id, type, amount, balance_after, description)
  values (new.id, 'bonus', 50, 50, 'Welcome bonus — 50 free Sparks ⚡');

  return new;
end;
$$ language plpgsql security definer;

-- 2. Grant existing users who got the old 10-Spark bonus an extra 40
-- Only for users who still have exactly 10 lifetime_earned (never purchased more)
-- and haven't spent any yet (balance = lifetime_earned)
update public.spark_balances
set balance = balance + 40,
    lifetime_earned = lifetime_earned + 40
where lifetime_earned = 10
  and balance = 10;

-- Log the bonus for affected users
insert into public.spark_transactions (user_id, type, amount, balance_after, description)
select
  sb.user_id,
  'bonus',
  40,
  sb.balance,
  'Welcome bonus upgrade — 40 additional Sparks ⚡'
from public.spark_balances sb
where sb.lifetime_earned = 50
  and sb.balance = 50
  and not exists (
    select 1 from public.spark_transactions st
    where st.user_id = sb.user_id
    and st.description = 'Welcome bonus upgrade — 40 additional Sparks ⚡'
  );

-- 3. Grant 50 Sparks to any real users who somehow have NO balance row
-- Filter via auth.users to exclude orphaned profiles (AI personas, etc.)
insert into public.spark_balances (user_id, balance, lifetime_earned)
select p.id, 50, 50
from public.profiles p
inner join auth.users au on au.id = p.id
left join public.spark_balances sb on sb.user_id = p.id
where sb.user_id is null;

-- Log those grants too
insert into public.spark_transactions (user_id, type, amount, balance_after, description)
select
  sb.user_id,
  'grant',
  50,
  50,
  'Retroactive welcome bonus — 50 Sparks ⚡'
from public.spark_balances sb
where sb.lifetime_earned = 50
  and sb.balance = 50
  and not exists (
    select 1 from public.spark_transactions st
    where st.user_id = sb.user_id
    and st.description like '%Welcome bonus%'
    limit 2
  )
  and (select count(*) from public.spark_transactions st where st.user_id = sb.user_id) = 0;
