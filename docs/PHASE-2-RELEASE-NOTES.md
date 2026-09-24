# Digital Dhamma Library — Phase 2 Release Notes

Version: 0.5.0  
Release: Phase 2 — Research Engine Foundation  
Baseline: 2026-09-24

## Goal

Phase 2 turns the Phase 1 reader/search prototype into a structured research foundation. The public GitHub Pages site remains static and data-driven, while Supabase/PostgreSQL receives a forward-compatible schema for later authenticated/editorial workflows.

## Included

- Research Workbench dashboard
- Edition registry
- Translation registry
- Dictionary detail pages
- Starter morphology index
- Exact Pāḷi occurrence index
- Cross-reference dataset
- Commentary registry metadata (no unverified commentary text)
- Text comparison page
- Plain/Markdown/BibTeX citation tools
- Research utility package
- Expanded data validation
- Phase 2 PostgreSQL migration
- Phase 2 architecture and research-data documentation
- GitHub Pages-compatible static export preserved

## Deliberate limitations

This release does **not** claim to contain a complete Tipiṭaka, complete Aṭṭhakathā/Ṭīkā corpus, critical editions, a complete Pāḷi morphological parser, or licensed copies of third-party dictionary/translation databases. The starter data exists to prove the architecture and UI.

## Verification before release

Run:

```powershell
npm ci
npm run validate:data
npm run typecheck
npm run build
npm run dev
```

Then inspect `/research/`, `/editions/`, `/translations/`, `/occurrences/`, `/dictionary/`, `/compare/mn10/`, and the normal reader/search routes.
