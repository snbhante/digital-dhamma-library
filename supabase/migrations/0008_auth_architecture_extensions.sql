-- Digital Dhamma Library: Phase 4.1 Auth architecture extensions.
-- Adds account lifecycle state, deterministic timestamps, and audit RPC support.

create table if not exists public.editorial_submissions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references auth.users(id) on delete cascade,
  target_id text not null,
  kind text not null,
  title text not null,
  body text not null,
  status text not null default 'DRAFT' check (status in ('DRAFT','SUBMITTED','IN_REVIEW','CHANGES_REQUESTED','APPROVED','PUBLISHED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  status text not null default 'DRAFT' check (status in ('DRAFT','REVIEW','APPROVED','PUBLISHED','REJECTED')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If a pre-v0.13.1 database already applied the earlier Phase 4 draft,
-- preserve that table as a legacy record before the canonical review schema is used.
do $$
begin
  if to_regclass('public.editorial_reviews') is not null
     and not exists (
       select 1 from information_schema.columns
       where table_schema = 'public'
         and table_name = 'editorial_reviews'
         and column_name = 'submission_id'
     ) then
    alter table public.editorial_reviews rename to editorial_reviews_legacy;
  end if;
end;
$$;

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

alter table public.profiles
  add column if not exists account_status text not null default 'ACTIVE'
    check (account_status in ('ACTIVE','SUSPENDED','DEACTIVATED')),
  add column if not exists suspension_reason text,
  add column if not exists last_seen_at timestamptz;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists editorial_submissions_set_updated_at on public.editorial_submissions;
create trigger editorial_submissions_set_updated_at
before update on public.editorial_submissions
for each row execute function public.set_updated_at();

drop trigger if exists media_assets_set_updated_at on public.media_assets;
create trigger media_assets_set_updated_at
before update on public.media_assets
for each row execute function public.set_updated_at();

drop trigger if exists workspace_snapshots_set_updated_at on public.workspace_snapshots;
create trigger workspace_snapshots_set_updated_at
before update on public.workspace_snapshots
for each row execute function public.set_updated_at();

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
    join public.profiles pr on pr.id = ur.user_id
    where ur.user_id = auth.uid()
      and pr.account_status = 'ACTIVE'
      and p.key = permission_key
  );
$$;

revoke all on function public.has_permission(text) from public;
grant execute on function public.has_permission(text) to authenticated;

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
    join public.profiles pr on pr.id = ur.user_id
    where ur.user_id = auth.uid()
      and pr.account_status = 'ACTIVE'
      and upper(r.name) = upper(role_name)
  );
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;

-- Authorized staff can write a structured audit record through a controlled RPC.
create or replace function public.append_audit_log(
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_old_value jsonb default null,
  p_new_value jsonb default null,
  p_reason text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  audit_id uuid;
begin
  if not public.has_permission('audit.read') then
    raise exception 'Not authorized to write audit records';
  end if;

  insert into public.audit_logs (
    actor_id, action, entity_type, entity_id, old_value, new_value, reason
  ) values (
    auth.uid(), p_action, p_entity_type, p_entity_id, p_old_value, p_new_value, p_reason
  ) returning id into audit_id;

  return audit_id;
end;
$$;

revoke all on function public.append_audit_log(text,text,text,jsonb,jsonb,text) from public;
grant execute on function public.append_audit_log(text,text,text,jsonb,jsonb,text) to authenticated;

-- Account lifecycle fields are administrative; ordinary users may not self-suspend or reactivate accounts.
create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.account_status is distinct from old.account_status or new.suspension_reason is distinct from old.suspension_reason)
     and not public.has_permission('user.suspend') then
    raise exception 'Only authorized administrators may change account lifecycle fields';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_admin_fields on public.profiles;
create trigger profiles_protect_admin_fields
before update on public.profiles
for each row execute function public.protect_profile_admin_fields();

-- Keep assigned_by trustworthy when roles are assigned from an authenticated admin UI.
create or replace function public.set_role_assignment_actor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.assigned_by is null then
    new.assigned_by = auth.uid();
  end if;
  return new;
end;
$$;

drop trigger if exists user_roles_set_assignment_actor on public.user_roles;
create trigger user_roles_set_assignment_actor
before insert on public.user_roles
for each row execute function public.set_role_assignment_actor();


-- Ensure the reconciliation path is protected even when the old Phase 4 migration was used.
alter table public.editorial_submissions enable row level security;
alter table public.editorial_reviews enable row level security;
alter table public.media_assets enable row level security;

drop policy if exists "contributors create submissions" on public.editorial_submissions;
drop policy if exists "users read own or staff submissions" on public.editorial_submissions;
drop policy if exists "contributors edit own drafts" on public.editorial_submissions;
drop policy if exists "editors manage submissions" on public.editorial_submissions;
drop policy if exists "reviewers read editorial reviews" on public.editorial_reviews;
drop policy if exists "reviewers create editorial reviews" on public.editorial_reviews;
drop policy if exists "public read published media" on public.media_assets;
drop policy if exists "contributors create media metadata" on public.media_assets;
drop policy if exists "owners and editors update media metadata" on public.media_assets;

create policy "contributors create submissions" on public.editorial_submissions for insert
with check (auth.uid() = contributor_id and (public.has_permission('content.create') or public.has_permission('content.edit')));
create policy "users read own or staff submissions" on public.editorial_submissions for select
using (auth.uid() = contributor_id or public.has_permission('content.review') or public.has_permission('content.publish'));
create policy "contributors edit own drafts" on public.editorial_submissions for update
using (auth.uid() = contributor_id and status in ('DRAFT','CHANGES_REQUESTED'))
with check (auth.uid() = contributor_id and status in ('DRAFT','CHANGES_REQUESTED'));
create policy "editors manage submissions" on public.editorial_submissions for update
using (public.has_permission('content.review') or public.has_permission('content.publish'))
with check (public.has_permission('content.review') or public.has_permission('content.publish'));
create policy "reviewers read editorial reviews" on public.editorial_reviews for select
using (auth.uid() = reviewer_id or public.has_permission('content.review'));
create policy "reviewers create editorial reviews" on public.editorial_reviews for insert
with check (auth.uid() = reviewer_id and public.has_permission('content.review'));
create policy "public read published media" on public.media_assets for select
using (status = 'PUBLISHED' or auth.uid() = created_by or public.has_permission('media.edit'));
create policy "contributors create media metadata" on public.media_assets for insert
with check (auth.uid() = created_by and public.has_permission('media.create'));
create policy "owners and editors update media metadata" on public.media_assets for update
using (auth.uid() = created_by or public.has_permission('media.edit'))
with check (auth.uid() = created_by or public.has_permission('media.edit'));

-- Backfill canonical roles/permissions for databases upgraded from an earlier Phase 4 draft.
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
('content.read','Read public content'),('content.create','Create content drafts'),('content.edit','Edit content drafts'),
('content.review','Review contributions'),('content.publish','Publish approved content'),('content.delete','Delete content'),
('dictionary.read','Read dictionary data'),('dictionary.edit','Edit dictionary records'),
('media.create','Create media metadata'),('media.edit','Edit media metadata'),('media.delete','Delete media metadata'),
('user.read','Read user administration records'),('user.edit','Edit user administration records'),('user.suspend','Suspend users'),
('role.assign','Assign roles'),('comment.moderate','Moderate comments'),('source.manage','Manage source metadata'),
('license.manage','Manage license metadata'),('audit.read','Read audit history')
on conflict (key) do update set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id from public.roles r cross join public.permissions p
where r.name = 'SUPER_ADMIN'
on conflict do nothing;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare reader_role_id uuid; display_name_value text;
begin
  display_name_value := coalesce(nullif(new.raw_user_meta_data ->> 'display_name',''), nullif(new.raw_user_meta_data ->> 'full_name',''), nullif(split_part(coalesce(new.email,''),'@',1),''), 'Researcher');
  insert into public.profiles (id, display_name, interface_language, public_profile, preferences, locale, is_public)
  values (new.id, display_name_value, 'en', false, '{}'::jsonb, 'en', false)
  on conflict (id) do update set display_name = coalesce(public.profiles.display_name, excluded.display_name), updated_at = now();
  select id into reader_role_id from public.roles where name = 'READER' limit 1;
  if reader_role_id is not null then
    insert into public.user_roles (user_id, role_id) values (new.id, reader_role_id) on conflict do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
