# Digital Dhamma Library — v0.13.1

## Auth / RBAC / Editorial Foundation Consolidation

### Included

- Canonical Supabase Auth architecture for static GitHub Pages deployment.
- 9-role RBAC model: GUEST, READER, CONTRIBUTOR, TRANSLATOR, RESEARCHER, EDITOR, MODERATOR, ADMIN, SUPER_ADMIN.
- Permission-based authorization boundary.
- `has_role()` and `has_permission()` PostgreSQL helpers.
- Automatic profile + READER provisioning after Auth signup.
- Extended researcher profile model with interface language, public profile, preferences, contributor handle, and account lifecycle state.
- AuthProvider now exposes session, user, roles, permissions, and authorization refresh.
- Central `authz.ts` role/permission helpers.
- Authenticated Dashboard.
- Administration foundation routes.
- Contributor submission client.
- Canonical editorial submission/review/media schema.
- Account lifecycle protection against client-side self-suspension.
- Audit RPC foundation.
- Migration reconciliation path for the previous Phase 4 editorial review schema.
- Removed incompatible server middleware from the GitHub Pages static-export path.
- Version metadata synchronized to v0.13.1.
- Expanded Phase 4–7 roadmap and deployment/setup documentation.
- Release ZIP excludes local `.env.local` credentials.

### Validation performed in the build workspace

Passed:

- UI validation
- Workspace validation
- Static build preparation
- Research index generation
- Data validation
- JSON/package metadata validation
- `git diff --check`
- duplicate migration-name check
- forbidden service-role key pattern scan of project source/docs

Not fully executable in the provided container:

- `npm ci` / complete dependency installation timed out.
- The container runtime is Node 22.16.0 with incomplete `node_modules`, while the project declares Node 24.21.x and npm 12.1.x.
- Therefore the final `npm run typecheck` and `npm run build` must be executed on the declared Node/npm runtime after a successful `npm ci`.

### Important upgrade note

The previous Phase 4 migration drafts were conflicting: both used the `0007` migration number and modeled `editorial_reviews` differently. v0.13.1 consolidates the canonical migration chain and archives the superseded drafts. Existing remote Supabase projects must inspect migration history before applying the upgrade.
