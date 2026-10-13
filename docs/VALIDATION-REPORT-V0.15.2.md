# Validation Report — Digital Dhamma Library v0.15.2

## Executed successfully in this build environment

- `node scripts/validate-architecture.mjs` — PASS
- `node scripts/validate-ui.mjs` — PASS
- `node scripts/validate-workspace.mjs` — PASS
- `node scripts/validate-data.mjs` — PASS
- `npm run prepare:static-build` — PASS (manifest and 13 referenced PWA assets)
- Static source review of Supabase browser client, Pages workflow, and migration `0010_auth_profile_backfill.sql` — completed

## Not passed / not verified

- `npm run typecheck` — BLOCKED: dependency installation did not complete; `next` executable unavailable.
- `npm ci` — did not complete within the available command execution window. Runtime here is Node `v22.16.0` / npm `10.9.2`, below repository requirements Node `>=24.21.0 <25` / npm `>=12.1.0`.
- `npm run build`, `npm run validate:release`, and `npm audit --audit-level=high` — not completed.
- Live Supabase migration application, Auth, RLS, profile CRUD, admin RPCs, GitHub Actions build, and live GitHub Pages smoke tests — not performed because they require the target project and user-controlled configuration/access.

## Release gate

Before publishing, run the complete commands in `SETUP&GUIDLINE.md` with the repository-pinned Node/npm versions, apply migrations to the intended Supabase project after reviewing the dry-run, and complete the live smoke tests. Do not describe blocked or unrun tests as passing.
