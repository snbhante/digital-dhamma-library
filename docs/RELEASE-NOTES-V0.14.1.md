# Digital Dhamma Library — v0.14.1 / Phase 4.3

## Purpose

v0.14.1 is a corrective and hardening release over v0.14.0. It treats the GitHub Pages static-export boundary and Supabase RLS/RBAC boundary as separate concerns and removes stale artifacts that could make a fresh setup fail.

## Release-blocking fixes

- Removed the incompatible legacy active `0007_phase_4_editorial.sql`.
- Kept one canonical active `0007_phase_4_editorial_foundation.sql`.
- Archived the incompatible draft under `docs/archive/migrations/`.
- Added `0009_phase_4_3_admin_control_plane.sql`.
- Added a complete permission matrix for all nine roles.
- Locked RBAC catalog tables (`roles`, `permissions`, `role_permissions`) to read-only client access.
- Restricted role assignment/revocation to database RPCs.
- Restricted account suspension/deactivation to a database RPC.
- Added database-validated editorial review transitions.
- Added append-only audit exploration.
- Replaced the hand-rolled Auth REST/localStorage token implementation with Supabase's browser client/Auth state model.
- Removed the dummy Supabase client fallback.
- Removed the stale `/todos/` sample route.
- Removed `middleware.ts`, middleware helper code, server Supabase helper, generated TypeScript state, `.env.local`, and repository `.git` metadata from the release archive.
- Retained Next.js 16.3.8, the current active-LTS security patch for this release line.

## Static deployment boundary

```text
GitHub Pages
  -> Next.js static export
  -> browser Supabase client
  -> Supabase Auth + Data API + PostgreSQL RLS

Future server runtime
  -> API / secret-key / server-only workloads
```

A request-time Proxy/Middleware is intentionally not part of this deployment profile.

## Supabase changes

Migration chain:

```text
0001_core.sql
0002_research_engine.sql
0003_phase_2_1_research.sql
0004_phase_2_2_research_review.sql
0005_phase_2_3_personal_workspace.sql
0006_phase_3_workspace_2.sql
0007_phase_4_editorial_foundation.sql
0008_auth_architecture_extensions.sql
0009_phase_4_3_admin_control_plane.sql
```

The old incompatible Phase 4 draft is historical documentation only.

## Validation boundary

The source-level release validators can be executed without network access:

```powershell
npm run validate:architecture
npm run validate:ui
npm run validate:workspace
npm run prepare:static-build
npm run build:research-index
npm run validate:data
```

Network-dependent final validation must be run after a successful `npm ci`:

```powershell
npm ci
npm run validate:release
```
