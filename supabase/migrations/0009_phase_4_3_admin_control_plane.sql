-- Digital Dhamma Library: Phase 4.3 / v0.14.1 Admin control plane.
-- Canonicalizes RBAC permissions, protects role assignment/account lifecycle,
-- and exposes only narrowly scoped SECURITY DEFINER RPCs for browser clients.
--
-- No secret/service-role key is required by the static GitHub Pages frontend.

-- Canonical role/permission seed data.
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
('content.read','Read public content'),
('content.create','Create content drafts'),
('content.edit','Edit content drafts'),
('content.review','Review contributions'),
('content.publish','Publish approved content'),
('content.delete','Delete content'),
('dictionary.read','Read dictionary data'),
('dictionary.edit','Edit dictionary records'),
('media.create','Create media metadata'),
('media.edit','Edit media metadata'),
('media.delete','Delete media metadata'),
('user.read','Read user administration records'),
('user.edit','Edit user administration records'),
('user.suspend','Suspend users'),
('role.assign','Assign roles'),
('comment.moderate','Moderate comments'),
('source.manage','Manage source metadata'),
('license.manage','Manage license metadata'),
('audit.read','Read audit history')
on conflict (key) do update set description = excluded.description;

-- Replace broad/legacy role-permission assignments with the canonical matrix.
delete from public.role_permissions;

with matrix(role_name, permission_key) as (
  values
    ('GUEST','content.read'),
    ('GUEST','dictionary.read'),

    ('READER','content.read'),
    ('READER','dictionary.read'),

    ('CONTRIBUTOR','content.read'),
    ('CONTRIBUTOR','content.create'),
    ('CONTRIBUTOR','content.edit'),
    ('CONTRIBUTOR','dictionary.read'),
    ('CONTRIBUTOR','media.create'),

    ('TRANSLATOR','content.read'),
    ('TRANSLATOR','content.create'),
    ('TRANSLATOR','content.edit'),
    ('TRANSLATOR','dictionary.read'),

    ('RESEARCHER','content.read'),
    ('RESEARCHER','content.create'),
    ('RESEARCHER','content.edit'),
    ('RESEARCHER','dictionary.read'),

    ('EDITOR','content.read'),
    ('EDITOR','content.create'),
    ('EDITOR','content.edit'),
    ('EDITOR','content.review'),
    ('EDITOR','content.publish'),
    ('EDITOR','content.delete'),
    ('EDITOR','dictionary.read'),
    ('EDITOR','dictionary.edit'),
    ('EDITOR','media.create'),
    ('EDITOR','media.edit'),
    ('EDITOR','media.delete'),
    ('EDITOR','source.manage'),
    ('EDITOR','license.manage'),

    ('MODERATOR','content.read'),
    ('MODERATOR','content.review'),
    ('MODERATOR','dictionary.read'),
    ('MODERATOR','media.edit'),
    ('MODERATOR','comment.moderate'),

    ('ADMIN','content.read'),
    ('ADMIN','content.create'),
    ('ADMIN','content.edit'),
    ('ADMIN','content.review'),
    ('ADMIN','content.publish'),
    ('ADMIN','content.delete'),
    ('ADMIN','dictionary.read'),
    ('ADMIN','dictionary.edit'),
    ('ADMIN','media.create'),
    ('ADMIN','media.edit'),
    ('ADMIN','media.delete'),
    ('ADMIN','user.read'),
    ('ADMIN','user.edit'),
    ('ADMIN','user.suspend'),
    ('ADMIN','role.assign'),
    ('ADMIN','comment.moderate'),
    ('ADMIN','source.manage'),
    ('ADMIN','license.manage'),
    ('ADMIN','audit.read'),

    ('SUPER_ADMIN','content.read'),
    ('SUPER_ADMIN','content.create'),
    ('SUPER_ADMIN','content.edit'),
    ('SUPER_ADMIN','content.review'),
    ('SUPER_ADMIN','content.publish'),
    ('SUPER_ADMIN','content.delete'),
    ('SUPER_ADMIN','dictionary.read'),
    ('SUPER_ADMIN','dictionary.edit'),
    ('SUPER_ADMIN','media.create'),
    ('SUPER_ADMIN','media.edit'),
    ('SUPER_ADMIN','media.delete'),
    ('SUPER_ADMIN','user.read'),
    ('SUPER_ADMIN','user.edit'),
    ('SUPER_ADMIN','user.suspend'),
    ('SUPER_ADMIN','role.assign'),
    ('SUPER_ADMIN','comment.moderate'),
    ('SUPER_ADMIN','source.manage'),
    ('SUPER_ADMIN','license.manage'),
    ('SUPER_ADMIN','audit.read')
)
insert into public.role_permissions(role_id, permission_id)
select r.id, p.id
from matrix m
join public.roles r on r.name = m.role_name
join public.permissions p on p.key = m.permission_key
on conflict do nothing;

-- Remove legacy Phase 4 policy names before installing the canonical policy set.
drop policy if exists "contributors create editorial submissions" on public.editorial_submissions;
drop policy if exists "contributors read own submissions" on public.editorial_submissions;
drop policy if exists "editors update submissions" on public.editorial_submissions;
drop policy if exists "reviewers read reviews" on public.editorial_reviews;
drop policy if exists "reviewers create reviews" on public.editorial_reviews;
drop policy if exists "public read approved media" on public.media_assets;
drop policy if exists "contributors create media metadata" on public.media_assets;
drop policy if exists "media editors manage metadata" on public.media_assets;
drop policy if exists "contributors create submissions" on public.editorial_submissions;
drop policy if exists "users read own or staff submissions" on public.editorial_submissions;
drop policy if exists "contributors edit own drafts" on public.editorial_submissions;
drop policy if exists "editors manage submissions" on public.editorial_submissions;
drop policy if exists "reviewers read editorial reviews" on public.editorial_reviews;
drop policy if exists "reviewers create editorial reviews" on public.editorial_reviews;
drop policy if exists "public read published media" on public.media_assets;
drop policy if exists "owners and editors update media metadata" on public.media_assets;

-- Canonical editorial/media policies.
create policy "editorial contributors create"
on public.editorial_submissions for insert
with check (
  auth.uid() = contributor_id
  and public.has_permission('content.create')
);

create policy "editorial users read own or reviewers"
on public.editorial_submissions for select
using (
  auth.uid() = contributor_id
  or public.has_permission('content.review')
  or public.has_permission('content.publish')
);

create policy "editorial contributors edit drafts"
on public.editorial_submissions for update
using (
  auth.uid() = contributor_id
  and status in ('DRAFT','CHANGES_REQUESTED')
)
with check (
  auth.uid() = contributor_id
  and status in ('DRAFT','CHANGES_REQUESTED')
);

create policy "editorial reviews readable"
on public.editorial_reviews for select
using (auth.uid() = reviewer_id or public.has_permission('content.review'));

create policy "editorial reviews create"
on public.editorial_reviews for insert
with check (auth.uid() = reviewer_id and public.has_permission('content.review'));

create policy "media published readable"
on public.media_assets for select
using (status = 'PUBLISHED' or auth.uid() = created_by or public.has_permission('media.edit'));

create policy "media contributors create"
on public.media_assets for insert
with check (auth.uid() = created_by and public.has_permission('media.create'));

create policy "media owners and editors update"
on public.media_assets for update
using (auth.uid() = created_by or public.has_permission('media.edit'))
with check (auth.uid() = created_by or public.has_permission('media.edit'));

-- Lock RBAC catalog tables to read-only client access. All writes happen
-- through migrations or privileged RPCs.
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "public read roles" on public.roles;
drop policy if exists "public read permissions" on public.permissions;
drop policy if exists "authenticated read role permissions" on public.role_permissions;

create policy "public read roles" on public.roles for select using (true);
create policy "public read permissions" on public.permissions for select using (true);
create policy "authenticated read role permissions" on public.role_permissions for select to authenticated using (true);

revoke insert, update, delete on public.roles from anon, authenticated;
revoke insert, update, delete on public.permissions from anon, authenticated;
revoke insert, update, delete on public.role_permissions from anon, authenticated;

-- Browser-safe administrative reads.
create policy "administrators read profiles"
on public.profiles for select
using (auth.uid() = id or public.has_permission('user.read'));

create policy "administrators read user roles"
on public.user_roles for select
using (auth.uid() = user_id or public.has_permission('user.read'));

-- Remove legacy role assignment paths. Assignment must go through the RPC below.
drop policy if exists "administrators insert user roles" on public.user_roles;
drop policy if exists "administrators delete user roles" on public.user_roles;
drop policy if exists "admins manage user roles" on public.user_roles;

-- SECURITY DEFINER RPC: assign a role without exposing a secret key.
create or replace function public.admin_assign_role(
  p_user_id uuid,
  p_role_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role_id uuid;
  normalized_role text := upper(trim(p_role_name));
begin
  if not public.has_permission('role.assign') then
    raise exception 'Not authorized to assign roles';
  end if;

  if normalized_role = 'SUPER_ADMIN' and not public.has_role('SUPER_ADMIN') then
    raise exception 'Only SUPER_ADMIN may assign SUPER_ADMIN';
  end if;

  select id into target_role_id
  from public.roles
  where name = normalized_role;

  if target_role_id is null then
    raise exception 'Unknown role: %', normalized_role;
  end if;

  insert into public.user_roles(user_id, role_id, assigned_by)
  values (p_user_id, target_role_id, auth.uid())
  on conflict (user_id, role_id) do nothing;

  perform public.append_audit_log(
    'ROLE_ASSIGNED',
    'user_roles',
    p_user_id::text,
    null,
    jsonb_build_object('role', normalized_role),
    'Administrative role assignment'
  );
end;
$$;

revoke all on function public.admin_assign_role(uuid, text) from public;
grant execute on function public.admin_assign_role(uuid, text) to authenticated;

create or replace function public.admin_revoke_role(
  p_user_id uuid,
  p_role_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_role_id uuid;
  normalized_role text := upper(trim(p_role_name));
begin
  if not public.has_permission('role.assign') then
    raise exception 'Not authorized to revoke roles';
  end if;

  if normalized_role = 'SUPER_ADMIN' and not public.has_role('SUPER_ADMIN') then
    raise exception 'Only SUPER_ADMIN may revoke SUPER_ADMIN';
  end if;

  select id into target_role_id from public.roles where name = normalized_role;
  if target_role_id is null then
    raise exception 'Unknown role: %', normalized_role;
  end if;

  if normalized_role = 'READER' then
    raise exception 'READER is the baseline authenticated role and cannot be revoked';
  end if;

  delete from public.user_roles
  where user_id = p_user_id and role_id = target_role_id;

  perform public.append_audit_log(
    'ROLE_REVOKED',
    'user_roles',
    p_user_id::text,
    jsonb_build_object('role', normalized_role),
    null,
    'Administrative role revocation'
  );
end;
$$;

revoke all on function public.admin_revoke_role(uuid, text) from public;
grant execute on function public.admin_revoke_role(uuid, text) to authenticated;

-- Account suspension/reactivation is controlled by permission and cannot be
-- self-escalated through ordinary profile updates.
create or replace function public.admin_set_account_status(
  p_user_id uuid,
  p_status text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized_status text := upper(trim(p_status));
begin
  if not public.has_permission('user.suspend') then
    raise exception 'Not authorized to change account status';
  end if;

  if normalized_status not in ('ACTIVE','SUSPENDED','DEACTIVATED') then
    raise exception 'Invalid account status: %', normalized_status;
  end if;

  if p_user_id = auth.uid() and normalized_status <> 'ACTIVE' then
    raise exception 'Administrators cannot suspend or deactivate themselves';
  end if;

  update public.profiles
  set account_status = normalized_status,
      suspension_reason = case when normalized_status = 'SUSPENDED' then nullif(trim(coalesce(p_reason,'')), '') else null end,
      updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'Profile not found';
  end if;

  perform public.append_audit_log(
    'ACCOUNT_STATUS_CHANGED',
    'profiles',
    p_user_id::text,
    null,
    jsonb_build_object('status', normalized_status, 'reason', p_reason),
    'Administrative account lifecycle change'
  );
end;
$$;

revoke all on function public.admin_set_account_status(uuid, text, text) from public;
grant execute on function public.admin_set_account_status(uuid, text, text) to authenticated;

-- Never allow direct client inserts/updates/deletes against role assignments.
alter table public.user_roles enable row level security;

drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles"
on public.user_roles for select
using (auth.uid() = user_id or public.has_permission('user.read'));

-- Audit records are append-only through the controlled RPC.
alter table public.audit_logs enable row level security;
drop policy if exists "admins read audit logs" on public.audit_logs;
create policy "administrators read audit logs"
on public.audit_logs for select
using (public.has_permission('audit.read'));

revoke insert, update, delete on public.audit_logs from anon, authenticated;

-- Prevent a normal profile update from changing privileged identity fields.
create or replace function public.protect_profile_identity_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() = old.id and not public.has_permission('user.edit') then
    if new.id is distinct from old.id then raise exception 'Profile id is immutable'; end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_protect_identity_fields on public.profiles;
create trigger profiles_protect_identity_fields
before update on public.profiles
for each row execute function public.protect_profile_identity_fields();

-- Helpful indexes for admin/reviewer queues.
create index if not exists idx_profiles_account_status on public.profiles(account_status);
create index if not exists idx_user_roles_role_id on public.user_roles(role_id);
create index if not exists idx_editorial_submissions_updated_at on public.editorial_submissions(updated_at desc);
create index if not exists idx_editorial_reviews_created_at on public.editorial_reviews(created_at desc);
