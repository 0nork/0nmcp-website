-- LinkedIn "Add to Profile" Certification System
-- Stores issued certifications for 0nMCP courses

create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  cert_id text unique not null,
  user_id uuid,
  user_email text not null,
  user_name text,
  course_slug text not null,
  cert_name text not null,
  issued_at timestamptz default now(),
  linkedin_url text,
  verified boolean default true,
  created_at timestamptz default now()
);

create index if not exists certifications_cert_id on certifications(cert_id);
create index if not exists certifications_user on certifications(user_email);

alter table certifications enable row level security;

-- Anyone can verify a certification (public read)
create policy "public_verify" on certifications for select using (true);

-- Service role can insert certifications
create policy "service_insert" on certifications for insert with check (true);
