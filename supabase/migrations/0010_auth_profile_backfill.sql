-- Complete profile columns expected by the v0.15.x browser client. Earlier
-- migration history did not consistently add these fields on fresh projects.
alter table public.profiles
  add column if not exists interface_language text not null default 'en',
  add column if not exists public_profile boolean not null default false,
  add column if not exists preferences jsonb not null default '{}'::jsonb,
  add column if not exists contributor_handle text;

-- Digital Dhamma Library v0.15.2: backfill profiles for existing Auth users.
-- The signup trigger in 0008 handles new users, but it does not retroactively
-- create profile rows for accounts that existed before that trigger was installed.
-- This migration is idempotent and preserves existing profile values.

insert into public.profiles (
  id, display_name, avatar_url, bio, locale, is_public,
  interface_language, public_profile, preferences
)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'display_name', ''),
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'Researcher'
  ),
  nullif(u.raw_user_meta_data ->> 'avatar_url', ''),
  null,
  'en',
  false,
  'en',
  false,
  '{}'::jsonb
from auth.users as u
on conflict (id) do nothing;

-- Ensure every existing authenticated account has at least the baseline READER
-- assignment where that role exists. Never elevate an account to an admin role.
insert into public.user_roles (user_id, role_id)
select u.id, r.id
from auth.users as u
join public.roles as r on r.name = 'READER'
on conflict (user_id, role_id) do nothing;

-- Ensure the canonical signup trigger exists for future Auth accounts.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  reader_role_id uuid;
  display_name_value text;
begin
  display_name_value := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'Researcher'
  );

  insert into public.profiles (
    id, display_name, interface_language, public_profile,
    preferences, locale, is_public
  ) values (
    new.id, display_name_value, 'en', false, '{}'::jsonb, 'en', false
  ) on conflict (id) do nothing;

  select id into reader_role_id from public.roles where name = 'READER' limit 1;
  if reader_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, reader_role_id)
    on conflict (user_id, role_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
