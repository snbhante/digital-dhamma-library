# SETUP AND GUIDELINE v0.15.1 — Digital Dhamma Library

Release scope: visual refinement of the public landing page, navigation, Account, Dashboard, and Advanced Research Reader; clearer Supabase profile diagnostics; release hygiene and verification workflow. This document does not claim that a remote Supabase project was reachable from the build environment. Verify the live project using the steps below.

## 1. Architecture and security boundary

- **GitHub Pages** hosts the statically exported Next.js frontend at `https://snbhante.github.io/digital-dhamma-library/`.
- **Supabase** provides Auth, Postgres, RLS, and the narrowly scoped role/editorial RPCs.
- The browser may contain only `NEXT_PUBLIC_SUPABASE_URL` and a Supabase **publishable** key. Never place a Supabase secret key, legacy `service_role` key, database password, or personal `.env.local` in Git, Pages artifacts, issues, or release ZIPs.
- Request-time Next.js Middleware/Proxy and server-only route handlers are not used in the GitHub Pages static-export profile.
- The canonical Buddhist corpus and public static research indexes remain version-controlled JSON; user profile and cloud workspace state live in Supabase.

## 2. Prerequisites

Use the versions pinned by the repository: Node.js `>=24.21.0 <25` and npm `>=12.1.0`. Confirm with:

```powershell
node --version
npm --version
git --version
```

If `npm ci` fails with `EINTEGRITY`, `EIDLETIMEOUT`, or Windows `EPERM`, close the dev server and editor terminals, stop stale Node processes, remove `node_modules`, verify the registry is `https://registry.npmjs.org/`, run `npm cache verify`, and retry on a stable network. Do not manually edit package integrity hashes or bypass integrity checks.


## 2A. Fix for `local environment credential file is present in release tree`

In v0.15.1, `scripts/validate-architecture.mjs` no longer treats the mere presence of a developer's local `.env.local` as a release failure. Local configuration is allowed in the working tree when it is ignored by Git and not tracked. The validator checks that `.gitignore` contains `.env.*` and `!.env.example`, and it checks Git-tracked paths for real `.env*` files. Keep `.env.local` at the repository root for local development; do not move secrets into `apps/web`, do not commit it, and do not add it to a release ZIP.

If the validator reports a tracked credential file, run `git rm --cached -- .env.local` (this keeps the local file), then confirm with `git ls-files -- .env.local`. If any real secret was already pushed to a remote repository, rotate it. For a source archive without a `.git` directory, the validator still checks the ignore rules; release archives must be packaged without `.env.local`, `.env.production`, or other real environment files.

## 3. Obtain and configure the project

```powershell
git clone https://github.com/snbhante/digital-dhamma-library.git
cd digital-dhamma-library
Copy-Item .env.example .env.local
```

Edit `.env.local` locally (never commit it):

```dotenv
NEXT_PUBLIC_BASE_PATH=
NEXT_ALLOWED_DEV_ORIGINS=localhost,127.0.0.1
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

For the GitHub Pages build, the workflow sets `NEXT_PUBLIC_BASE_PATH=/digital-dhamma-library`. The production Supabase URL and publishable key are configured as GitHub Actions **Variables** named `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. They are public client configuration, not secrets; no secret key belongs in these variables.

## 4. Supabase project and Auth setup

1. Create/open the Supabase project for Digital Dhamma Library and copy its Project URL and publishable key from the project API keys/settings.
2. In **Authentication → URL Configuration**, set Site URL to `https://snbhante.github.io/digital-dhamma-library/`.
3. Add redirect URLs for local development (`http://localhost:3000/**`) and production (`https://snbhante.github.io/digital-dhamma-library/**`). Keep the paths exact to the actual Pages project URL.
4. Enable Email/password in Authentication providers. Configure email confirmation and SMTP according to the desired production policy. OAuth providers are optional and require their provider credentials/callback configuration.
5. Create `.env.local` from `.env.example` and set the correct project values. Restart the dev server after editing environment variables.

## 5. Apply database migrations safely

Install Supabase CLI using the official supported installation method for your OS, then authenticate and link the correct project. Check the active migration files in `supabase/migrations/`; apply them in numeric order, from `0001_core.sql` through `0009_phase_4_3_admin_control_plane.sql`.

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list
supabase db push --dry-run
```

Review the dry-run and confirm that the linked project is the intended environment before applying:

```powershell
supabase db push
supabase migration list
```

Do not use `supabase db reset --linked` on a production project. Back up production data before schema changes. If migration history says a migration was applied but the schema is missing expected columns, stop and reconcile migration history with the actual schema rather than blindly re-running destructive SQL.

The profile screen selects `interface_language`, `public_profile`, `contributor_handle`, `account_status`, `suspension_reason`, and `last_seen_at` in addition to the original profile fields. These are added by the repository migrations. If the Account screen shows a database error, read the detailed error now shown by the UI and verify migrations 0001–0009, the `profiles` table columns, PostgREST schema cache, and the user's own-row RLS policies. After schema changes, refresh the API schema cache if Supabase indicates it is stale.

## 6. First administrator bootstrap

Only after all migrations have been applied, create a user through the normal Auth UI, then copy that user's UUID from Supabase Authentication. Use the SQL editor as a trusted project administrator to grant `SUPER_ADMIN` to that exact UUID:

```sql
insert into public.user_roles (user_id, role_id, assigned_by)
select 'YOUR_USER_UUID'::uuid, r.id, 'YOUR_USER_UUID'::uuid
from public.roles r
where r.name = 'SUPER_ADMIN'
on conflict do nothing;
```

Replace the placeholder before execution. Never grant a role based only on an email string. Sign out and back in, then verify the Dashboard and admin routes. Role assignment RPCs and RLS remain the security boundary; hiding a button in the UI is not authorization.

## 7. Local development

```powershell
npm ci
npm run dev
```

Open `http://localhost:3000`. Test both without Supabase configuration (local-first public reading) and with the correct project URL/publishable key. If running on a LAN, add only the needed dev origin to `NEXT_ALLOWED_DEV_ORIGINS`; do not use a wildcard unless you understand the exposure.

## 8. Required local validation

Run from the repository root:

```powershell
npm run validate:architecture
npm run validate:ui
npm run validate:workspace
npm run build:research-index
npm run validate:data
npm run typecheck
npm audit --audit-level=high
npm run build
npm run validate:release
```

`validate:release` repeats several checks by design. A successful static build writes the deployable site to `apps/web/out`. Verify that no `.env.local`, `.git`, `node_modules`, or `.next` folder is included in a release ZIP. Do not claim a validation passed unless the command exits with code 0 on the target machine.

## 9. Manual UI acceptance checks

- Landing page: brand and sign-in/account action are aligned; primary nav scrolls horizontally on small screens; search, Start reading, Research Workbench, and Explore library work.
- Account: form fields remain readable on desktop/mobile; save shows success or a useful Supabase error; sign-out returns to an unauthenticated state.
- Dashboard: stat cards and content cards do not overflow at 360px, 480px, 768px, 1024px, and 1440px widths; links to account, workspace, workbench, reader, review, and contributor workspace resolve.
- Advanced Reader: sidebar opens/closes on mobile; paragraph selection changes active paragraph; tabs change the research view; English/বাংলা toggles; citations/notes remain available; direct paragraph URL state survives refresh.
- Security: a reader cannot perform role assignment or moderation by calling UI functions directly; verify database RLS and RPC authorization with non-admin and admin test accounts.
- Accessibility: keyboard navigation, visible focus, labels, reduced-motion preference, and skip-to-content work.

## 10. GitHub Pages and Actions

1. Push the source branch to `main` only after validation.
2. In repository **Settings → Secrets and variables → Actions → Variables**, create `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. In **Settings → Pages**, use **GitHub Actions** as the build/deployment source.
4. Confirm the workflow has a green build and deploy job. The Pages artifact must be `apps/web/out`.
5. Open `https://snbhante.github.io/digital-dhamma-library/`, hard-refresh, and inspect browser DevTools → Network/Console for 404s, failed Supabase requests, CORS/redirect errors, or missing assets.
6. Test Auth confirmation and password reset using the configured redirect URLs. GitHub Pages is static; do not expect Next.js server routes or Middleware/Proxy to run there.

## 11. Commit, tag, and release

Inspect changes before committing:

```powershell
git status --short
git diff --check
git diff --stat
npm run validate:release
```

Then commit and tag the verified version:

```powershell
git add -A
git commit -m "Release v0.15.0: research UI refinement and setup diagnostics"
git push origin main
git tag -a v0.15.0 -m "Digital Dhamma Library v0.15.0"
git push origin v0.15.0
```

Create a GitHub Release from tag `v0.15.0`, attach the sanitized ZIP, and include release notes plus the SHA-256 hash. If `main` has remote changes, fetch and reconcile them first; do not force-push over unreviewed remote commits.

## 12. Troubleshooting matrix

| Symptom | Likely cause | Action |
|---|---|---|
| `Could not load profile` / PostgREST column error | Migration not applied, schema cache stale, or column mismatch | Read detailed error; verify 0001–0009 and `profiles` columns; refresh schema cache if needed |
| `Invalid API key` / failed Supabase request | Wrong URL/key or stale environment | Check `.env.local` and Actions variables; restart local dev server; use publishable key only |
| Email link returns to wrong page | Supabase Site URL/redirect allow-list incorrect | Set exact local and GitHub Pages redirect URLs |
| `Middleware cannot be used with output: export` | Request-time middleware file exists in static profile | Remove the unsupported middleware/server-only file and migrate callers to browser-safe code; do not convert to Proxy for Pages |
| `npm ci` integrity/timeout/EPERM | Broken cache/network interruption/file lock | Stop Node processes, remove `node_modules`, verify npm registry/cache, retry stable network |
| Build assets 404 on Pages | Base path or artifact path mismatch | Ensure Actions uses `/digital-dhamma-library` and uploads `apps/web/out` |
| User has no role/permissions | Role assignment/migration/bootstrap not complete | Check role seed data and `user_roles`; reauthenticate after bootstrap |

## 13. Release boundary and evidence

This ZIP is source code, not proof of a live database connection. A remote Supabase connection can only be verified against the user's actual project URL, key, Auth settings, migration state, RLS policies, and browser Network/Console. Never paste secret keys or database passwords into a support conversation. Record the actual command outputs in `docs/VALIDATION-REPORT-V0.15.0.md` after running checks locally and in GitHub Actions.
