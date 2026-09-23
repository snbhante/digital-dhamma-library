# Phase 1.2 — Research Reader & Search

## Included

- Expanded starter corpus: 14 works / 91 paragraphs.
- Stable paragraph IDs for every record.
- Search across Pāḷi, English, বাংলা, and metadata.
- Quoted phrase matching.
- Collection, type, language, and result-limit filters.
- Multilingual reader toggles.
- Reader font-size controls.
- Reader line-spacing controls.
- Local persistence of reader preferences.
- Source/provenance and rights notes in the reader.
- Stronger data validation.
- CI workflow for validation, typecheck, and production build.
- Root workspace typecheck command updated to avoid the deprecated single-hyphen npm workspace warning.
- Release/version manifest updated to `phase-1.2` / `0.3.0`.

## Verification performed for this package

- JSON parsing checks passed.
- `node --check scripts/validate-data.mjs` passed.
- `npm run validate:data` logic was executed directly and passed: 14 works / 91 paragraphs.
- The package is intentionally shipped without `node_modules`, `.next`, `out`, or `.git`.

A complete `npm ci`, TypeScript typecheck, and production build should still be run on the development machine/CI because the package-install network in the build environment is not reliable enough to claim a full dependency-based build verification here.
