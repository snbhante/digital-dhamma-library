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

## Phase 1.3 target

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

Authentication, bookmarks, notes, collections, contributions, administration, full dictionaries, commentaries, and research APIs are planned for later phases. Phase 1.3 includes only a small starter dictionary and source registry so the research architecture can be tested early. The public corpus remains source-aware and license-aware from the start.

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
