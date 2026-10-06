# Digital Dhamma Library v0.14.0 — Phase 4.2

## Release purpose

v0.14.0 is the security and architecture consolidation release after the v0.13.x Phase 4 baseline. It merges the canonical Auth/RBAC architecture into the latest project, removes the deprecated/unsupported static-export middleware path, upgrades Next.js to 16.3.8, and establishes the contributor/editorial/admin control plane for the next roadmap stages.

## Security and framework fixes

- Next.js upgraded from 16.3.6 to 16.3.8.
- Added `npm audit --audit-level=high` to CI and the release validation command.
- Removed `apps/web/middleware.ts`.
- Removed the unused `apps/web/utils/supabase/middleware.ts` helper.
- The project intentionally does **not** create `proxy.ts`: Next.js Proxy is not supported by `output: "export"`, while this project is deployed to GitHub Pages as a static export.
- Browser authentication uses Supabase Auth; authorization is enforced by PostgreSQL RLS and permission functions.
- No service-role or secret Supabase credential is exposed to the browser.

## Auth/RBAC consolidation

- Nine canonical roles: GUEST, READER, CONTRIBUTOR, TRANSLATOR, RESEARCHER, EDITOR, MODERATOR, ADMIN, SUPER_ADMIN.
- Permission registry and `has_permission()` / `has_role()` database helpers.
- Automatic READER provisioning for new accounts.
- Authenticated Dashboard.
- Administration foundation for users, roles, and audit.
- Contributor/editorial submission client flow.
- Account lifecycle protection.
- Audit RPC foundation.

## Database

The canonical migration sequence is now:

```text
0001_core.sql
0002_research_engine.sql
0003_phase_2_1_research.sql
0004_phase_2_2_research_review.sql
0005_phase_2_3_personal_workspace.sql
0006_phase_3_workspace_2.sql
0007_phase_4_editorial.sql
0008_auth_architecture_extensions.sql
```

The duplicate historical `0007_phase_4_editorial_foundation.sql` is archived under `docs/archive/migrations/` and is not part of the active migration chain.

## Next feature stages

### Phase 4.2–4.3

- contributor dashboard
- submission history
- revision history
- source/citation/license attachments
- reviewer queue filters
- assignment
- review comments
- request-changes workflow
- publish transition
- conflict-of-interest flags
- verification checklists
- admin user lifecycle controls
- permission inspection
- audit explorer

### Phase 5

- media storage abstraction
- rights/attribution registry
- transcripts
- paragraph-to-timestamp alignment
- synchronized reading/listening
- offline media metadata

### Phase 6

- dedicated API runtime
- OpenAPI
- API keys and scopes
- rate limits and quotas
- versioned dataset releases
- webhooks and SDK examples

### Phase 7

- PostgreSQL full-text search
- lemma/morphology-aware search
- fuzzy and semantic search
- sandhi and compound analysis
- OCR correction
- witness comparison and critical apparatus
- knowledge graph
- citation-first research assistant
- provenance-aware RAG

## Required validation before publishing

```bash
npm ci
npm run validate:release
```

The final production environment must use the declared Node/npm versions and a network connection so that `npm audit` and dependency installation can reach the npm registry.
