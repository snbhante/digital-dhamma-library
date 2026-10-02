# Digital Dhamma Library — Master Roadmap

## Current baseline — v0.13.1 / Phase 4.1

### Completed and retained

- Multilingual public reader: Pāḷi / English / বাংলা
- Stable work and paragraph IDs
- Local-first research workspace
- Bookmarks, notes, saved searches, collections
- Reading progress/history
- Research search and occurrence index
- Starter dictionary
- Morphology and derivation metadata
- Sentence segmentation and translation alignment
- Edition/witness metadata
- Citation profiles and cross references
- Knowledge graph foundation
- Research review queue
- PWA manifest, service worker, shortcuts, share target, file/protocol handler foundations
- GitHub Pages static export
- Supabase Auth foundation
- Supabase cloud workspace snapshots
- PostgreSQL RLS foundation
- Canonical 9-role RBAC model
- Permission-based authorization helpers
- Automatic profile + READER provisioning
- Contributor submission foundation
- Editorial review foundation
- Media metadata registry foundation
- Account lifecycle and audit RPC foundation
- Authenticated Dashboard and Administration entry surfaces

## Phase 4 — Editorial Platform 2.0

### A. Contributor

- contribution dashboard
- draft autosave
- submission history
- revision history
- contributor profile
- contributor handle
- source attachment
- citation attachment
- license declaration
- submission diff
- withdrawal workflow

### B. Reviewer / Editor

- queue filters
- assignment
- review comments
- request changes
- approve/reject
- publish transition
- conflict-of-interest flag
- source verification checklist
- license verification checklist
- immutable audit trail

### C. Administration

- user list
- account status controls
- role assignment/revocation
- permission inspection
- source management
- license management
- media moderation
- editorial reports
- audit explorer
- system settings

## Phase 5 — Media Platform

- audio/video/image/document registry
- storage provider abstraction
- media rights metadata
- creator/attribution metadata
- checksum and integrity metadata
- transcript registry
- paragraph-to-timestamp alignment
- synchronized reading/listening
- media collections
- offline media metadata
- PWA media launch handlers

## Phase 6 — API & Developer Platform

- dedicated API runtime
- `/v1/works`
- `/v1/paragraphs`
- `/v1/translations`
- `/v1/dictionary`
- `/v1/occurrences`
- `/v1/citations`
- `/v1/sources`
- `/v1/media`
- `/v1/research`
- OpenAPI
- API keys
- scoped permissions
- rate limiting
- quotas
- usage analytics
- versioned dataset releases
- reproducible download manifests
- webhooks
- SDK examples

## Phase 7 — Advanced Buddhist Research Engine

### Search

- PostgreSQL FTS
- phrase/proximity search
- field weighting
- fuzzy matching
- lemma-aware search
- cross-language search
- semantic vector search

### Pāḷi language technology

- tokenizer
- morphological analyzer
- inflection lookup
- sandhi splitter
- compound analyzer
- derivational analysis
- confidence/provenance per analysis

### Textual scholarship

- witness-to-witness comparison
- variant apparatus
- edition diff
- OCR correction
- review/approval pipeline
- source checksum verification
- critical-edition support

### Knowledge graph

- works
- people
- places
- concepts
- events
- teachers
- textual relationships
- commentarial relationships
- citation graph

### Research assistant

- citation-first retrieval
- source-aware answers
- paragraph-level provenance
- translation comparison
- dictionary evidence
- commentary evidence
- uncertainty labels
- reproducible research bundle export

## Release discipline for every future version

1. Update source code and migrations.
2. Update data/index generation.
3. Run UI validation.
4. Run workspace validation.
5. Run data validation.
6. Run TypeScript typecheck.
7. Run production static build.
8. Inspect `out/` for manifest, icons, routes, and PWA assets.
9. Verify Supabase migrations on a disposable database.
10. Verify RLS with anonymous, reader, contributor, reviewer, and admin test accounts.
11. Update release notes and version manifest.
12. Create Git tag.
13. Push branch and tag.
14. Verify GitHub Actions and GitHub Pages deployment.
