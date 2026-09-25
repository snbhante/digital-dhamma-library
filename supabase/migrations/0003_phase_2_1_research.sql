-- Digital Dhamma Library: Phase 2.1 research extensions.
-- Public research data remains versioned in Git; these tables are database mirrors/indexes.

create table if not exists public.work_sentences (
  id text primary key,
  work_id text not null references public.works(id) on delete cascade,
  paragraph_id text not null references public.work_paragraphs(id) on delete cascade,
  sentence_number integer not null,
  pali text not null,
  segmentation_method text not null default 'PUNCTUATION_HEURISTIC',
  confidence text not null default 'starter',
  unique(paragraph_id, sentence_number)
);

create table if not exists public.translation_alignments (
  id text primary key,
  translation_id text not null references public.translations(id) on delete cascade,
  work_id text not null references public.works(id) on delete cascade,
  paragraph_id text not null references public.work_paragraphs(id) on delete cascade,
  language text not null,
  source_text_unit text not null default 'paragraph',
  translation_text text not null,
  alignment_type text not null,
  confidence text not null default 'starter',
  note text
);

create unique index if not exists translation_alignments_unique_idx
  on public.translation_alignments(translation_id, paragraph_id);

create table if not exists public.dictionary_source_adapters (
  id text primary key,
  title text not null,
  source_kind text not null,
  status text not null,
  license_status text,
  mapping text,
  note text
);

create table if not exists public.lexical_derivations (
  id text primary key,
  headword text not null,
  base text not null,
  relation text not null,
  components jsonb not null default '[]'::jsonb,
  confidence text not null default 'starter',
  analysis text,
  note text
);

alter table public.work_sentences enable row level security;
alter table public.translation_alignments enable row level security;
alter table public.dictionary_source_adapters enable row level security;
alter table public.lexical_derivations enable row level security;

create policy "public read work sentences" on public.work_sentences for select using (true);
create policy "public read translation alignments" on public.translation_alignments for select using (true);
create policy "public read dictionary source adapters" on public.dictionary_source_adapters for select using (true);
create policy "public read lexical derivations" on public.lexical_derivations for select using (true);
