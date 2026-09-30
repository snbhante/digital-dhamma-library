## Current release: Phase 3 / v0.12.4

Phase 3 / v0.12.4 is a minor documentation and configuration update that adds explicit Supabase placeholder strings to the local environment template (`.env.example`), ensuring clearer onboarding for new developers configuring Workspace 2.0.

Phase 3 / v0.12.0 added Workspace 2.0: optional Supabase authentication, researcher profiles, local-first cloud synchronization, versioned private workspace snapshots, and account-aware workspace controls. It retains the complete v0.11 responsive reader, contextual paragraph actions, note overlay, PWA branding, research engine, and local workspace baseline.

The current baseline includes a local-first personal research workspace for paragraph bookmarks, private notes, saved searches, and personal collections, with JSON export/import and an authenticated Supabase persistence target.

# Digital Dhamma Library

**Open Buddhist Digital Knowledge & Research Platform**

> Read. Search. Study. Research. Connect the Dhamma.

This repository is the foundation for a free, open-source Buddhist digital library and research platform covering Pāḷi canonical texts, translations, commentaries, ṭīkā, dictionaries, cross-references, concepts, people, places, media metadata, research tools, and a citation-first search engine.

## Core principles

- Open and reproducible
- Source-first and citation-first
- Versioned datasets
- License-aware ingestion
- Stable identifiers
- Human-reviewed contributions
- Privacy by default
- Accessible and multilingual
- Regenerable search indexes

## Repository layout

```text
apps/
  web/                 Public reader / research UI
  admin/               Admin/editor UI boundary
  api/                 Future API service boundary
packages/
  shared/              Shared TypeScript types and utilities
  citations/           Citation formatting
  pali/                Pāḷi normalization/search helpers
  search/              Search contracts
  ui/                  Shared UI boundary
data/
  tipitaka/            Canonical/public-domain or licensed text datasets
  translations/        Translation datasets
  commentaries/        Aṭṭhakathā datasets
  tikas/               Ṭīkā datasets
  dictionaries/        Dictionary datasets
  concepts/            Concept records
  people/              Person records
  places/              Place records
docs/
  architecture/
  data/
  api/
  contribution/
  deployment/
scripts/
  validate/
  import/
supabase/
  migrations/
  seed/
.github/
  workflows/
```

## Current Phase 2.1 target

The first milestone is a working public reader that can:

1. Open works such as MN 10, MN 21, SN 56.11, AN 3.65, and selected Khuddakapāṭha/Dhammapada/Udāna records.
2. Display Pāḷi with stable paragraph IDs.
3. Display project-curated English/Bangla starter translations.
4. Search the local corpus with phrase matching and field filters.
5. Filter by collection, type, and language.
6. Copy a stable citation/link.
7. Toggle reader languages and adjust text size/line spacing.
8. Browse a library index and source/provenance registry.
9. Search a starter Pāḷi research dictionary.
10. Keep reader preferences locally on the device.
11. Validate data, typecheck, build, and deploy through GitHub Actions + GitHub Pages.

Phase 2.1 now adds sentence segmentation, paragraph-level translation alignment, lemma-aware occurrence search, dictionary-source adapter contracts, and starter compound/form metadata. Authentication, bookmarks, notes, collections, contributions, administration, full dictionaries, commentaries, and research APIs remain later milestones. The public corpus remains source-aware and license-aware from the start.

## Important legal rule

A text being available on the internet does **not** automatically mean it can be redistributed. Every imported dataset must carry provenance and licensing metadata. Copyright-restricted material must not be copied into this repository without permission.

## Local development

Requirements:

- Node.js 24.21.0 LTS
- npm 12.1.0

```bash
npm ci
npm run dev
```

Open the local address printed by Next.js.

Validate the repository:

```bash
npm run validate:data
npm run typecheck
npm run build
```

## Environment

Copy `.env.example` to `.env.local` when Supabase features are enabled.

Never commit secrets or service-role keys.

## Data workflow

```text
Original source
      ↓
License verification
      ↓
Import/parser
      ↓
Unicode normalization
      ↓
Stable IDs
      ↓
Metadata + provenance
      ↓
Validation
      ↓
Human review
      ↓
Git commit / release
      ↓
Search index generation
      ↓
Website build
```

## Contribution

See:

- `CONTRIBUTING.md`
- `docs/data/data-model.md`
- `docs/contribution/workflow.md`
- `docs/deployment/github-pages.md`

## License

The software architecture/code in this repository is intended to be released under MIT unless a later project decision changes it.

**Data files may have different licenses. Always check the dataset's own metadata before redistribution.**


## Phase 2 Research Engine

The current release adds an edition registry, translation registry, dictionary detail layer, exact Pāḷi occurrence index, starter morphology records, cross-reference graph, commentary metadata architecture, comparison reader, citation exports, and a forward-compatible Supabase/PostgreSQL research schema.

Start the local research workbench at `/research/`.

## Phase 2.1 Research Engine

The Phase 2.2 release (v0.7.0) adds edition-witness provenance, sentence-level heuristic alignment review records, richer starter morphology provenance, citation profiles, and a browser-local research review queue. All generated indexes are reproducible with `npm run build:research-index`.


### Phase 2.4

See `docs/PHASE-2.4-RELEASE-NOTES.md` and `docs/PHASE-2.4-GUIDE.md` for the offline-friendly reader, reading progress, recent reading history, command palette, theme preference, and accessibility enhancements.


### Phase 2.5.1
- Fixes `/share-target/` static-export prerendering by moving query-string access into the Client Component.
- Adds a pre-build regression guard that rejects request-time `searchParams` usage in the share-target Server Component.
- Retains all Phase 2.5 PWA manifest, SVG branding, file-handler, protocol-handler, and service-worker share features.


### Phase 2.6 / v0.11.0
- Adds a responsive layout matrix for large desktop, desktop/laptop, tablet, mobile, and compact-mobile screens.
- Adds contextual paragraph actions: hover on pointer devices, keyboard focus, and click/touch activation on touch devices.
- Groups citation, bookmark, and note actions into a compact paragraph action panel.
- Replaces the inline paragraph note editor with an accessible modal overlay supporting Escape-to-close, focus placement, delete, cancel, and save.
- Preserves the Phase 2.3 local-first workspace storage key so existing bookmarks, notes, saved searches, and collections are not discarded.
- Adds a static UI regression validator to the build/typecheck workflow.


### Phase 3 / v0.12.4 — Environment configuration placeholders

- Updated `.env.example` with clear dummy format placeholders for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` to guide local developer setup.

### Phase 3 / v0.12.3 — GitHub Actions CI alignment

- Synchronized `.github/workflows/ci.yml` to ensure the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` repository variables are correctly supplied to the Next.js CI build phase.

### Phase 3 / v0.12.2 — GitHub Actions CI fix

- Safely bypasses `@supabase/ssr` validation errors when Next.js attempts to statically pre-render pages in a CI environment where `NEXT_PUBLIC_SUPABASE_URL` is unavailable.
- Provides dummy fallback URLs in `apps/web/utils/supabase/client.ts` strictly to satisfy the build-time requirements of Next.js static generation without affecting runtime client behavior.

### Phase 3 / v0.12.1 — Workspace 2.0 maintenance fix

- Fixes the TypeScript `code 2` failure reported from `apps/web/components/AccountPanel.tsx` when calling `upsertProfile(session, ...)` from the nested `save()` handler.
- The authenticated session is captured after the existing `!session || !user` render guard, preserving strict TypeScript narrowing inside the callback.
- Adds a regression check to `scripts/validate-workspace.mjs` so the closure-safe pattern is retained in future edits.
- No Supabase schema, authentication flow, local workspace key, PWA behavior, or GitHub Pages static-export architecture is changed.

### Phase 3 / v0.12.0 — Workspace 2.0

- Optional Supabase email/password authentication without breaking GitHub Pages static export.
- Researcher account and profile page.
- Local-first workspace remains available when cloud credentials are absent.
- Authenticated workspace synchronization through a private `workspace_snapshots` row protected by Supabase RLS.
- Deterministic local/cloud merge for bookmarks, notes, saved searches, and collections.
- Manual “Sync now” control plus debounced background synchronization after workspace changes.
- Existing browser workspace storage key preserved for continuity.
- Workspace v2 JSON export/import.
- New authentication/account navigation surfaces and responsive account forms.
- Supabase environment template and migration 0006.

> Security boundary: only a Supabase publishable/anon key belongs in `NEXT_PUBLIC_*` variables. Never expose a service-role or secret key in the browser.
