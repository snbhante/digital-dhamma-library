# Digital Dhamma Library v0.14.0 — Complete Setup / Validation / GitHub Release Guide

## 1. Runtime requirements

Use the project's declared runtime:

```text
Node.js 24.21.x
npm 12.1.x
```

Verify:

```powershell
node -v
npm -v
```

## 2. Clean install

From the repository root:

```powershell
npm ci
```

Do not copy `node_modules` from another machine into the release tree.

## 3. Environment configuration

Copy the template:

```powershell
Copy-Item .env.example .env.local
```

Set only public browser-safe Supabase values:

```text
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLIC_PUBLISHABLE_KEY
NEXT_PUBLIC_BASE_PATH=/digital-dhamma-library
```

Never put a Supabase `service_role` secret in `.env.local` when that value can reach the browser build.

## 4. Full validation

Run:

```powershell
npm run validate:ui
npm run validate:workspace
npm run prepare:static-build
npm run build:research-index
npm run validate:data
npm run security:audit
npm run typecheck
npm run build
```

Or run the complete gate:

```powershell
npm run validate:release
```

A release is not considered verified until `typecheck` and `build` both finish successfully on the declared Node/npm runtime.

## 5. Why there is no `proxy.ts`

This project uses:

```text
output: "export"
```

and GitHub Pages.

Next.js Proxy/Middleware is a request-time server feature and is not supported by static export. Therefore the correct solution to the warning is **not** to run `middleware-to-proxy`; the correct solution is to remove the unused request-time auth layer and keep browser-side Supabase Auth plus PostgreSQL RLS.

Do not add a root `proxy.ts` unless the deployment architecture is deliberately changed from GitHub Pages static hosting to a server runtime.

## 6. API / getStaticProps warning

The current application uses the App Router and has no `getStaticProps` or `getStaticPaths` implementation.

The public API documentation is a future contract. It is not a Next.js API route running inside the static export.

If a real API is needed, deploy it separately using a supported server/Edge runtime and keep the static library client as the public frontend.

## 7. Supabase migration setup

The canonical migration chain is:

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

Before touching an existing production project:

```powershell
supabase login
supabase link
supabase migration list
supabase db push --dry-run
```

For a disposable local project:

```powershell
supabase db reset
supabase db push
```

Do not reset a production database merely to make migration history match. Resolve history differences explicitly.

## 8. Auth verification

Test these accounts separately:

```text
Anonymous
READER
CONTRIBUTOR
TRANSLATOR / RESEARCHER
EDITOR
MODERATOR
ADMIN
SUPER_ADMIN
```

Verify:

- anonymous can read only intentionally public data
- new users receive READER automatically
- contributors can create permitted submissions
- contributors cannot directly mutate canonical corpus records
- reviewers can review only permitted editorial data
- editors can approve/publish only permitted records
- role assignment is restricted
- suspended accounts lose effective permissions
- audit records are protected

## 9. Git verification

```powershell
git status
git diff --check
git diff --stat
git branch --show-current
git remote -v
```

Expected remote:

```text
https://github.com/snbhante/digital-dhamma-library.git
```

## 10. Commit

```powershell
git add .
git commit -m "Release v0.14.0 auth RBAC static export security update"
```

## 11. Sync before push

If `main` is shared:

```powershell
git fetch origin
git log --oneline --graph --decorate --all -30
```

If the histories are compatible:

```powershell
git pull --rebase origin main
git push origin main
```

Do not force-push `main` unless you have explicitly decided to rewrite the repository history and have a backup.

## 12. Tag the release

```powershell
git tag -a v0.14.0 -m "Digital Dhamma Library v0.14.0"
git push origin v0.14.0
```

## 13. GitHub Release

Create a release from tag `v0.14.0`.

Recommended title:

```text
Digital Dhamma Library v0.14.0 — Auth/RBAC + Static Export Security Update
```

Attach the source ZIP if desired.

## 14. GitHub Pages

Open:

```text
Repository
 → Settings
 → Pages
 → Source: GitHub Actions
```

Then inspect:

```text
Actions
 → CI
 → Pages deployment
```

The deployed site should be checked for:

- `/`
- `/works/`
- `/search/`
- `/dictionary/`
- `/research/`
- `/auth/`
- `/account/`
- `/dashboard/`
- `/editorial/`
- `/admin/`
- `/share-target/`
- PWA manifest
- icons
- service worker

## 15. Rollback

If v0.14.0 fails after deployment:

```powershell
git revert <bad-commit>
git push origin main
```

For a database migration problem, stop the application rollout first and inspect Supabase migration history. Do not blindly delete or reset production tables.

## 16. Security policy

The public static application may contain:

- Supabase project URL
- Supabase publishable/anon key
- public corpus metadata

It must never contain:

- service-role key
- database password
- private API secret
- AI provider secret
- administrator credentials

All privileged operations belong behind Supabase RLS or a future dedicated server/API boundary.
