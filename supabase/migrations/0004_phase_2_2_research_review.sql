-- Digital Dhamma Library: Phase 2.2 research review and provenance extensions.
-- Canonical corpus remains versioned in Git. These tables are database-ready mirrors and review records.

create table if not exists public.edition_witnesses (
  id text primary key,
  work_id text not null references public.works(id) on delete cascade,
  edition_id text references public.editions(id),
  edition_label text not null,
  role text not null,
  text_status text not null,
  verification_status text not null default 'unverified',
  independent_witness boolean not null default false,
  paragraph_count integer not null default 0,
  source_provenance text,
  license_status text,
  checksum text,
  note text
);

create table if not exists public.sentence_alignments (
  id text primary key,
  translation_id text not null references public.translations(id) on delete cascade,
  work_id text not null references public.works(id) on delete cascade,
  paragraph_id text not null references public.work_paragraphs(id) on delete cascade,
  source_sentence_id text,
  translation_sentence_number integer,
  source_pali text,
  translation_text text,
  alignment_type text not null,
  confidence text not null default 'starter',
  review_status text not null default 'NEEDS_REVIEW',
  review_note text
);

create table if not exists public.morphology_analyses (
  id text primary key,
  token text not null,
  normalized text not null,
  lemma text,
  analysis_type text not null,
  grammar text,
  source_record text,
  confidence text not null default 'starter',
  review_status text not null default 'UNREVIEWED',
  review_note text,
  provenance text
);

create table if not exists public.citation_profiles (
  id text primary key,
  label text not null,
  format text not null,
  template text not null,
  note text
);

create table if not exists public.research_annotations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_id text not null,
  entity_type text not null,
  status text not null default 'UNREVIEWED',
  body text,
  source_id text references public.sources(id),
  citation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, target_id, entity_type)
);

alter table public.edition_witnesses enable row level security;
alter table public.sentence_alignments enable row level security;
alter table public.morphology_analyses enable row level security;
alter table public.citation_profiles enable row level security;
alter table public.research_annotations enable row level security;

create policy "public read edition witnesses" on public.edition_witnesses for select using (true);
create policy "public read sentence alignments" on public.sentence_alignments for select using (true);
create policy "public read morphology analyses" on public.morphology_analyses for select using (true);
create policy "public read citation profiles" on public.citation_profiles for select using (true);
create policy "users read own research annotations" on public.research_annotations for select using (auth.uid() = user_id);
create policy "users manage own research annotations" on public.research_annotations for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
