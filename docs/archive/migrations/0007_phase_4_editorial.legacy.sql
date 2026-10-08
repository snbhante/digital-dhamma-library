-- Digital Dhamma Library: Phase 4 / v0.13.1 canonical Auth + RBAC + Editorial foundation.
-- Static GitHub Pages clients use publishable Supabase credentials only.
-- PostgreSQL RLS and SECURITY DEFINER authorization helpers are the security boundary.

-- -----------------------------------------------------------------------------
-- 1. Profile fields required by the Auth / User architecture.
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column if not exists interface_language text not null default 'en',
  add column if not exists public_profile boolean not null default false,
  add column if not exists preferences jsonb not null default '{}'::jsonb,
  add column if not exists contributor_handle text;

update public.profiles
set interface_language = coalesce(nullif(interface_language, ''), locale, 'en'),
    public_profile = coalesce(public_profile, is_public, false)
where interface_language is null or interface_language = '';

create unique index if not exists profiles_contributor_handle_unique_idx
  on public.profiles(contributor_handle)
  where contributor_handle is not null;

-- -----------------------------------------------------------------------------
-- 2. Canonical roles / permissions.
-- -----------------------------------------------------------------------------
insert into public.roles (name, description) values
('GUEST', 'Anonymous public visitor'),
('READER', 'Authenticated reader with personal workspace access'),
('CONTRIBUTOR', 'Can create reviewed contribution drafts and submissions'),
('TRANSLATOR', 'Can contribute translation material'),
('RESEARCHER', 'Research-oriented authenticated contributor'),
('EDITOR', 'Can review, approve, and publish editorial content'),
('MODERATOR', 'Can moderate community/editorial records'),
('ADMIN', 'Application administrator'),
('SUPER_ADMIN', 'Full administrative control')
on conflict (name) do update set description = excluded.description;

insert into public.permissions (key, description) values
('content.read', 'Read public content'),
('content.create', 'Create content drafts'),
('content.edit', 'Edit content drafts'),
('content.review', 'Review contributions'),
('content.publish', 'Publish approved content'),
('content.delete', 'Delete content'),
('dictionary.read', 'Read dictionary data'),
('dictionary.edit', 'Edit dictionary records'),
('media.create', 'Create media metadata'),
('media.edit', 'Edit media metadata'),
('media.delete', 'Delete media metadata'),
('user.read', 'Read user administration records'),
('user.edit', 'Edit user administration records'),
('user.suspend', 'Suspend users'),
('role.assign', 'Assign roles'),
('comment.moderate', 'Moderate comments'),
('source.manage', 'Manage source metadata'),
('license.manage', 'Manage license metadata'),
('audit.read', 'Read audit history')
on conflict (key) do update set description = excluded.description;

-- Replace the old partial role mapping with one deterministic canonical mapping.
delete from public.role_permissions rp
using public.roles r
where rp.role_id = r.id;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key = 'content.read'
where r.name in ('READER','CONTRIBUTOR','TRANSLATOR','RESEARCHER','EDITOR','MODERATOR','ADMIN','SUPER_ADMIN')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('dictionary.read')
where r.name in ('READER','CONTRIBUTOR','TRANSLATOR','RESEARCHER','EDITOR','MODERATOR','ADMIN','SUPER_ADMIN')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('content.create','content.edit','media.create','media.edit')
where r.name in ('CONTRIBUTOR','TRANSLATOR','RESEARCHER','EDITOR','ADMIN','SUPER_ADMIN')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('dictionary.edit','source.manage','license.manage','content.review','content.publish','audit.read')
where r.name in ('EDITOR','ADMIN','SUPER_ADMIN')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('comment.moderate')
where r.name in ('MODERATOR','ADMIN','SUPER_ADMIN')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in ('content.delete','media.delete','user.read','user.edit','user.suspend','role.assign')
where r.name in ('ADMIN','SUPER_ADMIN')
on conflict do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on p.key in (
  'content.read','content.create','content.edit','content.review','content.publish','content.delete',
  'dictionary.read','dictionary.edit','media.create','media.edit','media.delete','user.read','user.edit',
  'user.suspend','role.assign','comment.moderate','source.manage','license.manage','audit.read'
)
where r.name = 'SUPER_ADMIN'
on conflict do nothing;

-- -----------------------------------------------------------------------------
-- 3. Authorization helpers. SECURITY DEFINER avoids recursive RLS evaluation.
-- -----------------------------------------------------------------------------
create or replace function public.has_role(role_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = auth.uid()
      and upper(r.name) = upper(role_name)
  );
$$;

create or replace function public.has_permission(permission_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    join public.role_permissions rp on rp.role_id = ur.role_id
    join public.permissions p on p.id = rp.permission_id
    where ur.user_id = auth.uid()
      and p.key = permission_key
  );
$$;

revoke all on function public.has_role(text) from public;
revoke all on function public.has_permission(text) from public;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.has_permission(text) to authenticated;

-- -----------------------------------------------------------------------------
-- 4. New-user provisioning: profile + default READER role.
-- -----------------------------------------------------------------------------
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
    id, display_name, interface_language, public_profile, preferences, locale, is_public
  ) values (
    new.id, display_name_value, 'en', false, '{}'::jsonb, 'en', false
  )
  on conflict (id) do update set
    display_name = coalesce(public.profiles.display_name, excluded.display_name),
    updated_at = now();

  select id into reader_role_id from public.roles where name = 'READER' limit 1;
  if reader_role_id is not null then
    insert into public.user_roles (user_id, role_id)
    values (new.id, reader_role_id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

-- Trigger is created only when auth.users is available (which is true in Supabase).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -----------------------------------------------------------------------------
-- 5. Editorial submission/review/media entities.
-- -----------------------------------------------------------------------------
create table if not exists public.editorial_submissions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references auth.users(id) on delete cascade,
  target_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  status text not null default 'DRAFT'
    check (status in ('DRAFT','SUBMITTED','IN_REVIEW','CHANGES_REQUESTED','APPROVED','PUBLISHED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_editorial_submissions_contributor on public.editorial_submissions(contributor_id);
create index if not exists idx_editorial_submissions_status on public.editorial_submissions(status);

create table if not exists public.editorial_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.editorial_submissions(id) on delete cascade,
  reviewer_id uuid not null references auth.users(id) on delete cascade,
  decision text not null check (decision in ('APPROVE','REQUEST_CHANGES','REJECT','COMMENT')),
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_editorial_reviews_submission on public.editorial_reviews(submission_id);
create index if not exists idx_editorial_reviews_reviewer on public.editorial_reviews(reviewer_id);

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references auth.users(id) on delete set null,
  target_id text,
  media_type text not null check (media_type in ('audio','video','image','document','external')),
  title text not null,
  source_url text,
  creator text,
  license text,
  checksum text,
  duration_seconds numeric,
  width integer,
  height integer,
  status text not null default 'DRAFT'
    check (status in ('DRAFT','REVIEW','APPROVED','PUBLISHED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_media_assets_target on public.media_assets(target_id);
create index if not exists idx_media_assets_status on public.media_assets(status);

-- -----------------------------------------------------------------------------
-- 6. RLS policies: database enforcement, not UI-only gating.
-- -----------------------------------------------------------------------------
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;
alter table public.user_roles enable row level security;
alter table public.profiles enable row level security;
alter table public.editorial_submissions enable row level security;
alter table public.editorial_reviews enable row level security;
alter table public.media_assets enable row level security;

-- Clean up conflicting policies from the Phase 1/Phase 4 drafts when upgrading.
drop policy if exists "profiles are publicly readable only when opted in" on public.profiles;
drop policy if exists "users can update own profile" on public.profiles;
drop policy if exists "users can insert own profile" on public.profiles;
drop policy if exists "public read profiles" on public.profiles;
drop policy if exists "public read editorial reviews" on public.editorial_reviews;
drop policy if exists "editors manage editorial reviews" on public.editorial_reviews;
drop policy if exists "admins read audit logs" on public.audit_logs;
drop policy if exists "users read own roles" on public.user_roles;
drop policy if exists "contributors create editorial submissions" on public.editorial_submissions;
drop policy if exists "contributors read own submissions" on public.editorial_submissions;
drop policy if exists "editors update submissions" on public.editorial_submissions;
drop policy if exists "reviewers read reviews" on public.editorial_reviews;
drop policy if exists "reviewers create reviews" on public.editorial_reviews;
drop policy if exists "public read approved media" on public.media_assets;
drop policy if exists "contributors create media metadata" on public.media_assets;
drop policy if exists "media editors manage metadata" on public.media_assets;

create policy "public read opt-in profiles"
on public.profiles for select
using (public_profile = true or auth.uid() = id);

create policy "users update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id);

create policy "users insert own profile"
on public.profiles for insert
with check (auth.uid() = id);

create policy "authenticated read roles"
on public.roles for select
using (auth.uid() is not null);

create policy "authenticated read permissions"
on public.permissions for select
using (auth.uid() is not null);

create policy "authenticated read role permissions"
on public.role_permissions for select
using (auth.uid() is not null);

create policy "users read own roles"
on public.user_roles for select
using (auth.uid() = user_id or public.has_permission('role.assign'));

create policy "admins assign roles"
on public.user_roles for insert
with check (public.has_permission('role.assign'));

create policy "admins update roles"
on public.user_roles for update
using (public.has_permission('role.assign'))
with check (public.has_permission('role.assign'));

create policy "admins revoke roles"
on public.user_roles for delete
using (public.has_permission('role.assign'));

create policy "contributors create submissions"
on public.editorial_submissions for insert
with check (
  auth.uid() = contributor_id
  and (
    public.has_permission('content.create')
    or public.has_permission('content.edit')
  )
);

create policy "users read own or staff submissions"
on public.editorial_submissions for select
using (
  auth.uid() = contributor_id
  or public.has_permission('content.review')
  or public.has_permission('content.publish')
);

create policy "contributors edit own drafts"
on public.editorial_submissions for update
using (auth.uid() = contributor_id and status in ('DRAFT','CHANGES_REQUESTED'))
with check (auth.uid() = contributor_id and status in ('DRAFT','CHANGES_REQUESTED'));

create policy "editors manage submissions"
on public.editorial_submissions for update
using (public.has_permission('content.review') or public.has_permission('content.publish'))
with check (public.has_permission('content.review') or public.has_permission('content.publish'));

create policy "reviewers read editorial reviews"
on public.editorial_reviews for select
using (
  auth.uid() = reviewer_id
  or public.has_permission('content.review')
);

create policy "reviewers create editorial reviews"
on public.editorial_reviews for insert
with check (
  auth.uid() = reviewer_id
  and public.has_permission('content.review')
);

create policy "public read published media"
on public.media_assets for select
using (
  status = 'PUBLISHED'
  or auth.uid() = created_by
  or public.has_permission('media.edit')
);

create policy "contributors create media metadata"
on public.media_assets for insert
with check (
  auth.uid() = created_by
  and public.has_permission('media.create')
);

create policy "owners and editors update media metadata"
on public.media_assets for update
using (auth.uid() = created_by or public.has_permission('media.edit'))
with check (auth.uid() = created_by or public.has_permission('media.edit'));

-- Audit logs are readable only by authorized staff. Writes remain server/database-controlled.
drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "authorized staff read audit logs"
on public.audit_logs for select
using (public.has_permission('audit.read'));
