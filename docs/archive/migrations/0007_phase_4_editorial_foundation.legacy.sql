-- Phase 4 foundation: authenticated contribution workflow and media metadata registry.
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
      and r.name = role_name
  );
$$;

revoke all on function public.has_role(text) from public;
grant execute on function public.has_role(text) to authenticated;

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

alter table public.user_roles enable row level security;
alter table public.editorial_submissions enable row level security;
alter table public.editorial_reviews enable row level security;
alter table public.media_assets enable row level security;

create policy "users read own roles"
on public.user_roles for select
using (auth.uid() = user_id);

create policy "contributors create editorial submissions"
on public.editorial_submissions for insert
with check (
  auth.uid() = contributor_id
  and (
    public.has_role('CONTRIBUTOR') or public.has_role('TRANSLATOR') or public.has_role('RESEARCHER') or public.has_role('EDITOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN')
  )
);

create policy "contributors read own submissions"
on public.editorial_submissions for select
using (auth.uid() = contributor_id or public.has_role('EDITOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN'));

create policy "editors update submissions"
on public.editorial_submissions for update
using (public.has_role('EDITOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN'))
with check (public.has_role('EDITOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN'));

create policy "reviewers read reviews"
on public.editorial_reviews for select
using (auth.uid() = reviewer_id or public.has_role('EDITOR') or public.has_role('MODERATOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN'));

create policy "reviewers create reviews"
on public.editorial_reviews for insert
with check (auth.uid() = reviewer_id and (public.has_role('EDITOR') or public.has_role('MODERATOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN')));

create policy "public read approved media"
on public.media_assets for select
using (status = 'PUBLISHED' or auth.uid() = created_by or public.has_role('EDITOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN'));

create policy "contributors create media metadata"
on public.media_assets for insert
with check (auth.uid() = created_by and (public.has_role('CONTRIBUTOR') or public.has_role('EDITOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN')));

create policy "media editors manage metadata"
on public.media_assets for update
using (auth.uid() = created_by or public.has_role('EDITOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN'))
with check (auth.uid() = created_by or public.has_role('EDITOR') or public.has_role('ADMIN') or public.has_role('SUPER_ADMIN'));
