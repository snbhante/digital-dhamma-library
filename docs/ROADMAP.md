# Digital Dhamma Library Roadmap

## Completed

- Phase 1.1 — reader/search foundation
- Phase 1.2 — multilingual starter corpus and research search
- Phase 1.3 — library, source registry, starter dictionary
- Phase 2 — research engine foundation

## Phase 2 completed foundation

1. Canonical work/paragraph stable IDs
2. Edition registry
3. Translation registry
4. Dictionary detail architecture
5. Exact word occurrence index
6. Starter morphology index
7. Cross-reference registry
8. Commentary/Ṭīkā metadata architecture
9. Citation export formats
10. PostgreSQL/Supabase research schema

## Phase 2.1 completed foundation

- Sentence segmentation without changing paragraph IDs
- Translation alignment records
- Dictionary-source adapter registry
- Lemma-aware occurrence search
- Starter Pāḷi compound/derivation metadata
- Expanded research workbench routes

## Phase 2.2 completed foundation

- Edition witness registry with explicit non-bundled alternate-witness slots
- Sentence-level heuristic translation alignment records with review status
- Richer starter morphology analysis records with provenance
- Citation templates and export profiles
- Browser-local research review queue and annotation notes
- Supabase-ready authenticated research annotation schema

## Phase 2.3 next implementation target

- Import at least one independently verified alternate edition only after source/license/checksum review
- Add true witness-to-witness variant display and diffing
- Add sentence alignment editor with persistent authenticated review records
- Expand morphology with auditable sandhi/compound rules and source citations
- Add dictionary import adapters with per-source license gates and import manifests
- Add citation export bundles and reproducible research snapshots

## Phase 2.6 / v0.11.0 completed

Reader UX and responsible responsive layout:
- Large/medium/small responsive breakpoints across desktop, laptop, tablet, and mobile.
- Contextual paragraph actions with hover, keyboard focus, click, and touch activation.
- Compact action panel for citation, bookmark, and note controls.
- Accessible overlay note editor with Escape-to-close and mobile-safe sizing.
- Build-time UI regression checks.

## Phase 3 / v0.12.0 completed

## Phase 4 / v0.13.0 initial editorial platform

- Implemented Supabase migration for Role-Based Access Control (RBAC), profiles, global review queue, and audit logs.

## Phase 3 / v0.12.5 feature

- Added JSON export and import capabilities to the Research Review Queue workbench.

## Phase 3 / v0.12.4 documentation update

- Updated `.env.example` with Supabase configuration format placeholders.

## Phase 3 / v0.12.3 maintenance fix

- Synchronized `ci.yml` CI GitHub Actions workflow with the `NEXT_PUBLIC_SUPABASE` repository variables.

## Phase 3 / v0.12.2 maintenance fix

- Resolved a Next.js static pre-rendering crash in GitHub Actions CI pipelines caused by `@supabase/ssr` validation errors when environment variables are missing.

## Phase 3 / v0.12.1 maintenance fix

- Fixed strict TypeScript control-flow narrowing in the authenticated account profile save callback.
- Added a workspace validator regression guard for the authenticated-session capture pattern.


Workspace 2.0:
- Optional browser-side Supabase authentication for GitHub Pages/static deployment.
- Researcher profile management.
- Local-first workspace continuity with the existing storage key.
- Private authenticated workspace snapshot persistence protected by RLS.
- Deterministic local/cloud merge and debounced background synchronization.
- Manual sync, account settings, and v2 workspace export/import.

## Phase 4

Editorial platform: RBAC, contributor workflow, review queue, moderation, source/license manager, audit log.

## Phase 5

Audio, video, image records, external media, and text/media synchronization.

## Phase 6

Public API, OpenAPI specification, API keys, rate limiting, developer documentation, dataset releases.

## Phase 7

Knowledge graph, semantic search, OCR correction, morphology models, and citation-first research assistant/RAG.
