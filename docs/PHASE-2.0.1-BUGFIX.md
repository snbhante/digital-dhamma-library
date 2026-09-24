# Phase 2.0.1 Bugfix Release

Version: 0.5.1

## Fixed

### 1. Static export dynamic routes

Next.js static export does not support dynamic routes with `dynamicParams: true` or without `generateStaticParams()`. The dynamic reader, comparison, and dictionary routes now explicitly set:

```ts
export const dynamicParams = false;
```

This makes the GitHub Pages/static-export contract explicit.

### 2. Dictionary URL slugs

Pāḷi headwords remain fully diacritic-preserving, but dictionary route URLs now use ASCII-safe slugs:

- `/dictionary/metta/` → mettā
- `/dictionary/anatta/` → anattā
- `/dictionary/nibbana/` → nibbāna
- `/dictionary/panna/` → paññā
- `/dictionary/samadhi/` → samādhi
- `/dictionary/sila/` → sīla

The internal dictionary IDs remain stable and continue to use the canonical headword IDs.

### 3. Duplicate React keys

Search results are deduplicated by stable `workId + paragraphId`, and reader paragraph keys now include the work ID. This prevents duplicate-key warnings from stale/repeated search results or future corpus merges.

## Verification

Run with the project's declared Node.js/npm versions:

```powershell
npm ci
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
npm run dev
```
