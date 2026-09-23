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

## Phase 1 target

The first milestone is a working public reader that can:

1. Open a work such as MN 10.
2. Display Pāḷi with stable paragraph IDs.
3. Display English/Bangla translations when licensed data is available.
4. Search the local corpus.
5. Open a dictionary entry.
6. Copy a stable citation/link.
7. Work responsively on mobile and desktop.
8. Deploy as a static site through GitHub Pages.

Authentication, bookmarks, notes, collections, contributions, and administration are designed into the data model and will be enabled in later phases through Supabase.

## Important legal rule

A text being available on the internet does **not** automatically mean it can be redistributed. Every imported dataset must carry provenance and licensing metadata. Copyright-restricted material must not be copied into this repository without permission.

## Local development

Requirements:

- Node.js 20+
- npm 10+

```bash
npm install
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
