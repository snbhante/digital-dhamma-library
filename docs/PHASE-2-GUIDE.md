# Phase 2 — Detailed Upgrade Guide

## 1. Purpose

Phase 2 establishes the research-engine foundation while keeping the public site deployable on GitHub Pages. The public corpus remains versioned in Git; mutable user/application data is reserved for Supabase/PostgreSQL.

## 2. Local installation

Use the project runtime declared by the repository:

```powershell
node --version
npm --version
```

Expected major versions:

- Node.js 24.21.x
- npm 12.1.x

Then:

```powershell
cd C:\Users\snbhante\VSCodeProjects\digital-dhamma-library
npm ci
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
npm run dev
```

## 3. Research routes

- `/research/` — Research Workbench
- `/editions/` — edition registry
- `/translations/` — translation registry
- `/occurrences/` — exact Pāḷi occurrence index
- `/dictionary/` — dictionary index
- `/dictionary/dhamma/` — lexical detail example
- Dictionary detail routes use ASCII-safe slugs (for example `/dictionary/metta/` for mettā) so static export remains robust while preserving diacritics in the displayed headword.
- `/compare/mn10/` — side-by-side text comparison
- `/search/` — multilingual research search
- `/sources/` — provenance registry

## 4. What Phase 2 data means

The current data is a starter research dataset. It proves the schema and UI. It is not a complete critical edition, complete Tipiṭaka, complete Aṭṭhakathā/Ṭīkā corpus, complete morphology engine, or complete dictionary database.

## 5. Updating the corpus

1. Add or edit a record in `data/corpus.json`.
2. Preserve the stable work ID.
3. Preserve existing paragraph IDs when text is edited only for metadata; do not casually renumber paragraphs.
4. Record source, edition, license, and provenance.
5. Run `npm run build:research-index`.
6. Run `npm run validate:data`.
7. Review the generated indexes.
8. Run typecheck/build.
9. Commit the source and generated research indexes together.

## 6. Adding a new edition

Do not replace an old edition. Create a new edition record and link the work to the correct edition. Later Phase 2.1 will allow the same work to expose multiple editions and compare their paragraph/sentence alignment.

## 7. Adding a translation

Treat each translation as an independent resource. Keep translator, language, license, source, and verification metadata separate from the Pāḷi text.

## 8. Adding Aṭṭhakathā/Ṭīkā

First register the source and rights. Then register the commentary as a work/resource. Only after verification should text segments be imported. Link commentary segments to stable canonical targets through explicit relations.

## 9. Morphology

`data/morphology.json` is deliberately conservative. It is a starter lexical-form index. Future morphology work should distinguish:

- surface form
- lemma
- POS
- case/number/gender or relevant grammatical features
- derivation/compound information
- parser/rule version
- confidence
- human review status

## 10. Supabase migration

Phase 2 adds `supabase/migrations/0002_research_engine.sql`. Apply migrations in order. Do not expose a service-role key in the GitHub Pages frontend. Public read policies are intentionally separated from future editor/service write policies.

## 11. Git workflow

After local verification:

```powershell
git status
git add .
git commit -m "Upgrade Digital Dhamma Library to Phase 2 Research Engine"
git push origin main
```

GitHub Actions should then build and deploy the static site.

## 12. Release checklist

- [ ] `npm ci` succeeds on Node 24.21.x / npm 12.1.x
- [ ] `npm run build:research-index` succeeds
- [ ] `npm run validate:data` succeeds
- [ ] `npm run typecheck` succeeds
- [ ] `npm run build` succeeds
- [ ] Home page works
- [ ] Search works
- [ ] Reader deep links work
- [ ] Dictionary index/detail works
- [ ] Research Workbench works
- [ ] Editions/translations/occurrences pages work
- [ ] Comparison route works
- [ ] GitHub Pages deployment succeeds
- [ ] Source/licensing notes are reviewed before adding third-party datasets
