# Phase 1.3 — Research Foundation

## Goal

Phase 1.3 turns the Phase 1.2 reader/search prototype into a clearer research foundation without prematurely coupling the public static site to authentication or a backend.

## Included

- Relevance-ordered local search results with stable filters.
- Library index at `/works/`.
- Source/provenance registry at `/sources/`.
- Starter Pāḷi research dictionary at `/dictionary/`.
- Dictionary data validation.
- Separate source registry for future licensed imports.
- Reader previous/next work navigation.
- Reader preference reset control.
- Configurable LAN development origin through `NEXT_ALLOWED_DEV_ORIGINS`.
- Cleaner repository packaging rules excluding generated artifacts.
- Version 0.4.0 / Phase 1.3 release manifest.

## Data status

The dictionary is a small project-curated starter lexicon. It is intentionally not represented as DPD, PED, PEA, Concise Pali-English Dictionary, DPPN, or any other third-party dictionary. Future third-party data must be imported only after rights/licensing review.

The corpus remains a starter research dataset and is not a claim of critical-edition status.

## Local verification

Use the project's pinned runtime: Node.js 24.21.0 and npm 12.1.0.

```bash
npm ci
npm run validate:data
npm run typecheck
npm run build
npm run dev
```

For LAN development, set for example:

```powershell
$env:NEXT_ALLOWED_DEV_ORIGINS="192.168.1.13"
npm run dev
```

If you use only `localhost`, the default origin setting can simply be left alone.
