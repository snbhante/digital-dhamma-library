-- Digital Dhamma Library: Phase 3 / v0.12 Workspace 2.0.
-- A JSON snapshot provides a stable, loss-resistant bridge between the existing
-- local-first workspace model and authenticated cloud persistence. The canonical
-- Buddhist corpus remains versioned in Git and is never written by this table.

create table if not exists public.workspace_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  schema_version integer not null default 2,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workspace_snapshots_updated_at on public.workspace_snapshots(updated_at);

alter table public.workspace_snapshots enable row level security;

create policy "users manage own workspace snapshot"
on public.workspace_snapshots for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
