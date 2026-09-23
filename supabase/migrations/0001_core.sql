-- Digital Dhamma Library: core application schema
-- Run in Supabase/PostgreSQL.
-- Canonical public corpus remains versioned in Git; application state lives here.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  bio text,
  locale text not null default 'en',
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  primary key (role_id, permission_id)
);

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  assigned_by uuid references auth.users(id),
  primary key (user_id, role_id)
);

create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_id text not null,
  label text,
  created_at timestamptz not null default now(),
  unique(user_id, target_id)
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_id text not null,
  body text not null,
  visibility text not null default 'private'
    check (visibility in ('private','shared','public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  query jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.reading_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  target_id text not null,
  progress numeric(5,4) not null default 0 check (progress >= 0 and progress <= 1),
  last_read_at timestamptz not null default now(),
  primary key (user_id, target_id)
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id text,
  old_value jsonb,
  new_value jsonb,
  reason text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.notes enable row level security;
alter table public.saved_searches enable row level security;
alter table public.reading_history enable row level security;
alter table public.audit_logs enable row level security;

create policy "profiles are publicly readable only when opted in"
on public.profiles for select
using (is_public = true or auth.uid() = id);

create policy "users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users can insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "users read own bookmarks"
on public.bookmarks for select
using (auth.uid() = user_id);

create policy "users manage own bookmarks"
on public.bookmarks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users read own notes or public notes"
on public.notes for select
using (auth.uid() = user_id or visibility = 'public');

create policy "users manage own notes"
on public.notes for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own saved searches"
on public.saved_searches for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own reading history"
on public.reading_history for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Audit logs are intentionally not writable by ordinary clients.
