# Phase 3 / v0.13.0 — Advanced Research Platform

## Purpose

v0.13.0 consolidates the next research-oriented milestones on top of Workspace 2.0 instead of adding another phase-only label. The release is intentionally a **working platform foundation**: features that require a hosted server beyond GitHub Pages are represented by secure contracts, registries, Supabase tables, and explicit deployment boundaries rather than pretending that a static site is an API server.

## Included

### Advanced Research Reader 1.0
- Parallel Pāḷi / English / বাংলা reading.
- Translation toggle and paragraph-level alignment status.
- Commentary/Aṭṭhakathā/Ṭīkā registry panel.
- Dictionary side panel derived from the starter lexical index.
- Personal notes/bookmarks through the existing Workspace tools.
- Curated related-record panel and knowledge-graph navigation.
- Stable paragraph anchors and URL state (`p`, `tab`).
- Mobile research drawer.
- Classic-reader fallback.

### Search 2.0
- Terms, phrase, and exact modes.
- `lemma:` operator.
- `work:` operator.
- `collection:` operator.
- `language:` operator.
- translation-presence filter.
- commentary-presence filter.
- relevance ordering and stable research-reader links.

### Commentary + Edition Comparison foundation
- Commentary segment template registry.
- Explicit no-invented-text rule.
- Edition variant template registry.
- Bundled-witness and future alternate-witness separation retained.
- Reader exposes the comparison boundary without fabricating variant readings.

### Contributor / Editorial foundation
- Contributor submission form.
- Editorial workflow states.
- Supabase `editorial_submissions` and `editorial_reviews` tables.
- Role-aware RLS using `has_role()`.
- Media metadata table and registry.
- Existing research review queue remains separate from publication workflow.

### Media foundation
- Audio/video/image/external-resource registry.
- Source, creator, license, checksum, target and publication-state requirements.
- No unverified copyrighted media bundled.

### API foundation
- Versioned API capability contract.
- Endpoint definitions for works, paragraphs, search, dictionary and citations.
- Explicit boundary: GitHub Pages remains static; a hosted API runtime is required before endpoints are actually served.

### Semantic search, OCR and research-assistant foundation
- Deterministic lexical retrieval baseline.
- Reserved BM25/embedding/hybrid ranking contract.
- OCR correction template that preserves source reading and reviewer metadata.
- Auditable morphology sandhi/compound rule template.
- Citation-first research assistant that always returns stable source IDs and explicitly reports missing evidence.

### Knowledge graph foundation
- Curated research-edge registry.
- Graph navigation between stable work IDs.
- Conservative semantics: research-related edges are not claims of textual dependence.

## Data files added

- `data/research-config.json`
- `data/commentary-segments.json`
- `data/edition-variants.json`
- `data/editorial-workflow.json`
- `data/media-registry.json`
- `data/api-capabilities.json`
- `data/knowledge-graph.json`

## Supabase migration

Apply `supabase/migrations/0007_phase_4_editorial_foundation.sql` after migration 0006.

The migration adds:

- `editorial_submissions`
- `editorial_reviews`
- `media_assets`
- `has_role(text)` helper
- role-aware RLS policies
- own-role read policy for authenticated users

## Static-hosting boundary

No service-role key is required or permitted in the browser. The application continues to use browser-side Supabase Auth/PostgREST because GitHub Pages is a static host.

The public API is a contract only in v0.13.0. Do not publish a secret API key or claim that `/v1/*` endpoints are live until a separate server/runtime is deployed.

## Research integrity

This release does not claim:

- a complete critical edition;
- verified alternate readings where no alternate witness is bundled;
- a complete Pāḷi morphological parser;
- complete Aṭṭhakathā/Ṭīkā text;
- automatically inferred doctrinal dependence;
- scholarly authentication of starter translations.

Future imported records must preserve source, edition, license, checksum where appropriate, provenance, reviewer, stable ID, and audit metadata.
