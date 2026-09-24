-- Digital Dhamma Library: Phase 2 research engine schema.
-- Public corpus remains versioned in Git. These tables are future-ready database mirrors/indexes.

create table if not exists public.sources (
  id text primary key,
  title text not null,
  kind text not null,
  url text,
  license_status text,
  provenance text,
  created_at timestamptz not null default now()
);

create table if not exists public.editions (
  id text primary key,
  source_id text references public.sources(id),
  title text not null,
  edition_label text not null,
  language text,
  publisher text,
  publication_year integer,
  url text,
  license_status text,
  verification_status text not null default 'unverified',
  version text,
  checksum text,
  created_at timestamptz not null default now()
);

create table if not exists public.works (
  id text primary key,
  collection text not null,
  title text not null,
  description text,
  canonical_language text not null default 'Pāḷi',
  work_type text not null,
  edition_id text references public.editions(id),
  stable_slug text unique,
  created_at timestamptz not null default now()
);

create table if not exists public.work_paragraphs (
  id text primary key,
  work_id text not null references public.works(id) on delete cascade,
  paragraph_number integer not null,
  pali text not null,
  created_at timestamptz not null default now(),
  unique(work_id, paragraph_number)
);

create table if not exists public.translations (
  id text primary key,
  work_id text not null references public.works(id) on delete cascade,
  edition_id text references public.editions(id),
  language text not null,
  title text,
  translator text,
  translation_type text not null default 'PROJECT_CURATED',
  license_status text,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now()
);

create table if not exists public.translation_segments (
  id uuid primary key default gen_random_uuid(),
  translation_id text not null references public.translations(id) on delete cascade,
  paragraph_id text not null references public.work_paragraphs(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now(),
  unique(translation_id, paragraph_id)
);

create table if not exists public.dictionary_sources (
  id text primary key,
  title text not null,
  abbreviation text,
  edition text,
  url text,
  license_status text,
  provenance text,
  created_at timestamptz not null default now()
);

create table if not exists public.dictionary_entries (
  id text primary key,
  source_id text references public.dictionary_sources(id),
  headword text not null,
  grammar text,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.dictionary_senses (
  id uuid primary key default gen_random_uuid(),
  entry_id text not null references public.dictionary_entries(id) on delete cascade,
  sense_number integer not null,
  english text,
  bangla text,
  created_at timestamptz not null default now(),
  unique(entry_id, sense_number)
);

create table if not exists public.dictionary_forms (
  id uuid primary key default gen_random_uuid(),
  entry_id text not null references public.dictionary_entries(id) on delete cascade,
  form text not null,
  form_type text,
  morphology jsonb,
  confidence text not null default 'starter',
  created_at timestamptz not null default now(),
  unique(entry_id, form)
);

create table if not exists public.word_occurrences (
  id bigserial primary key,
  paragraph_id text not null references public.work_paragraphs(id) on delete cascade,
  surface_form text not null,
  normalized_form text not null,
  lemma text,
  token_index integer,
  edition_id text references public.editions(id),
  analysis_source text,
  analysis_confidence text,
  created_at timestamptz not null default now()
);

create index if not exists word_occurrences_normalized_idx on public.word_occurrences(normalized_form);
create index if not exists word_occurrences_lemma_idx on public.word_occurrences(lemma);

create table if not exists public.cross_references (
  id uuid primary key default gen_random_uuid(),
  from_target_id text not null,
  to_target_id text not null,
  relation text not null,
  source_id text references public.sources(id),
  note text,
  created_at timestamptz not null default now(),
  unique(from_target_id, to_target_id, relation)
);

create table if not exists public.commentaries (
  id text primary key,
  work_id text references public.works(id) on delete cascade,
  title text not null,
  commentary_type text not null check (commentary_type in ('ATTHAKATHA','TIKA','OTHER')),
  source_id text references public.sources(id),
  edition_id text references public.editions(id),
  license_status text,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now()
);

create table if not exists public.commentary_segments (
  id text primary key,
  commentary_id text not null references public.commentaries(id) on delete cascade,
  target_id text,
  text text,
  paragraph_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.citations (
  id uuid primary key default gen_random_uuid(),
  target_id text not null,
  edition_id text references public.editions(id),
  citation_style text not null,
  citation_text text not null,
  url text,
  created_at timestamptz not null default now()
);

alter table public.sources enable row level security;
alter table public.editions enable row level security;
alter table public.works enable row level security;
alter table public.work_paragraphs enable row level security;
alter table public.translations enable row level security;
alter table public.translation_segments enable row level security;
alter table public.dictionary_sources enable row level security;
alter table public.dictionary_entries enable row level security;
alter table public.dictionary_senses enable row level security;
alter table public.dictionary_forms enable row level security;
alter table public.word_occurrences enable row level security;
alter table public.cross_references enable row level security;
alter table public.commentaries enable row level security;
alter table public.commentary_segments enable row level security;
alter table public.citations enable row level security;

-- Phase 2 public research records are readable; writes should later be restricted to editor/service roles.
create policy "public read sources" on public.sources for select using (true);
create policy "public read editions" on public.editions for select using (true);
create policy "public read works" on public.works for select using (true);
create policy "public read work paragraphs" on public.work_paragraphs for select using (true);
create policy "public read translations" on public.translations for select using (true);
create policy "public read translation segments" on public.translation_segments for select using (true);
create policy "public read dictionary sources" on public.dictionary_sources for select using (true);
create policy "public read dictionary entries" on public.dictionary_entries for select using (true);
create policy "public read dictionary senses" on public.dictionary_senses for select using (true);
create policy "public read dictionary forms" on public.dictionary_forms for select using (true);
create policy "public read occurrences" on public.word_occurrences for select using (true);
create policy "public read cross references" on public.cross_references for select using (true);
create policy "public read commentaries" on public.commentaries for select using (true);
create policy "public read commentary segments" on public.commentary_segments for select using (true);
create policy "public read citations" on public.citations for select using (true);
