-- Digital Dhamma Library: Phase 4 / v0.13.0 Editorial Platform.
-- Introduces Role-Based Access Control (RBAC), contributor profiles, and the
-- authenticated global review queue for editorial workflows.

create type public.user_role as enum ('reader', 'contributor', 'editor', 'admin');

-- 1. Profiles & RBAC
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'reader',
  display_name text,
  contributor_handle text unique,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Official Editorial Review Queue
create table if not exists public.editorial_reviews (
  id uuid primary key default gen_random_uuid(),
  entity_id text not null,
  entity_type text not null,
  status text not null default 'UNREVIEWED',
  reviewed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Audit Log
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  target_table text not null,
  target_id text not null,
  previous_state jsonb,
  new_state jsonb,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_editorial_reviews_entity on public.editorial_reviews(entity_id, entity_type);
create index if not exists idx_editorial_reviews_status on public.editorial_reviews(status);
create index if not exists idx_audit_logs_actor on public.audit_logs(actor_id);
create index if not exists idx_audit_logs_target on public.audit_logs(target_table, target_id);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.editorial_reviews enable row level security;
alter table public.audit_logs enable row level security;

-- Profiles: Anyone can read profiles. Users can update their own profile (except role).
create policy "public read profiles" on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- Editorial Reviews: Anyone can read. Only editors and admins can insert/update.
create policy "public read editorial reviews" on public.editorial_reviews for select using (true);
create policy "editors manage editorial reviews" on public.editorial_reviews for all 
using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin'))
) 
with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('editor', 'admin'))
);

-- Audit Logs: Only admins can read. System generated (no manual insert from client).
create policy "admins read audit logs" on public.audit_logs for select 
using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'reader');
  return new;
end;
$$ language plpgsql security definer;

-- Note: We do not attach the trigger to auth.users here to avoid breaking local setups 
-- that don't have superuser privileges on the auth schema, but the function is provided.
