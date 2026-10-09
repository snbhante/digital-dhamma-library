# Validation Report — v0.15.0

## Completed in the release-preparation environment

- `node scripts/validate-architecture.mjs` — PASS.
- `node scripts/validate-ui.mjs` — PASS.
- `node scripts/validate-workspace.mjs` — PASS.
- `node scripts/build-research-index.mjs` — PASS; regenerated indexes: 1 edition, 2 translations, 11 morphology records, 385 indexed tokens, 94 sentence records, 188 sentence alignments, 182 paragraph alignments, 5 dictionary adapters, 6 morphology analyses, 28 edition witness records, 5 citation profiles, 579 review queue records, 23 derivation records, 22 cross-reference links.
- `node scripts/validate-data.mjs` — PASS; 14 works, 91 paragraphs, 94 sentences, 11 dictionary entries, 2 source records, 1 edition, 2 translation resources, and the additional research registries validated.
- Release hygiene: `.env.local`, `.git`, `node_modules`, `.next`, and static output directories are excluded from the ZIP source tree.
- Active Supabase migration sequence is unique and numbered 0001–0009; the legacy duplicate 0007 SQL files remain only in `docs/archive/migrations/`.
- Package-lock `@next/env@16.3.8` integrity matches the published npm metadata recorded in the lockfile (`sha512-Al9zqHVV7TJv0eFuOU4U7Lvv74PTih4Ch63sk2xCIpSTkE3udFnaOcnzP2lQVymiL7yS9Cj2iClUXlR3EQ5sEw==`).

## Not verified here

- `npm run typecheck` and `npm run build`: dependencies were intentionally removed from the distributable archive and could not be installed in this isolated environment. Run these locally after `npm ci`.
- `npm audit --audit-level=high`: npm registry DNS/network request failed (`EAI_AGAIN registry.npmjs.org`), so no new audit result is asserted. Run it on a networked machine.
- Live Supabase connectivity, actual schema migration state, Auth redirect behavior, RLS, and GitHub Actions/Pages deployment cannot be proven by static source inspection. Follow `SETUP AND GUIDLINE v0.15.0.md` and record the live test results before production release.

## Required before tagging

Run `npm ci`, then `npm run validate:release` from the project root on a networked Windows/Node environment. Resolve every failure before committing/tagging. After push, confirm both CI and Pages workflow jobs are green and manually test account profile read/save against the intended Supabase project.
