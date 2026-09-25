-- Digital Dhamma Library: Phase 2.3 personal research workspace.
-- The GitHub Pages client remains local-first; these tables provide the authenticated persistence target.

create table if not exists public.user_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, name)
);

create table if not exists public.collection_bookmarks (
  collection_id uuid not null references public.user_collections(id) on delete cascade,
  bookmark_id uuid not null references public.bookmarks(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (collection_id, bookmark_id)
);

create index if not exists idx_user_collections_user_id on public.user_collections(user_id);
create index if not exists idx_collection_bookmarks_bookmark_id on public.collection_bookmarks(bookmark_id);

alter table public.user_collections enable row level security;
alter table public.collection_bookmarks enable row level security;

create policy "users manage own collections"
on public.user_collections for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own collection bookmarks"
on public.collection_bookmarks for all
using (
  exists (
    select 1 from public.user_collections c
    where c.id = collection_id and c.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.user_collections c
    where c.id = collection_id and c.user_id = auth.uid()
  )
);
