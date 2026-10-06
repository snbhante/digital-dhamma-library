# Digital Dhamma Library v0.13.1 — Auth/RBAC + Editorial Foundation Setup

## 1. Runtime

Use the project runtime declared by the repository:

```powershell
node -v
npm -v
```

Expected baseline:

- Node 24.21.x
- npm 12.1.x
- Next.js 16.3.6
- TypeScript 6.0.3

## 2. Clean install

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\out -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
npm ci
```

## 3. Environment

Copy `.env.example` to `.env.local`:

```env
NEXT_PUBLIC_BASE_PATH=/digital-dhamma-library
NEXT_ALLOWED_DEV_ORIGINS=127.0.0.1,localhost
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_OR_ANON_KEY
```

Only the publishable/anon key belongs in the static browser build. Never expose a service-role/secret key through `NEXT_PUBLIC_*`.

## 4. Supabase database

The canonical migration chain is now:

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

`0007` is the canonical v0.13.1 Phase 4 Auth/RBAC/editorial migration. The previous conflicting Phase 4 draft migration has been archived under `docs/archive/migrations/`.

For a brand-new Supabase project:

```powershell
supabase login
supabase link
supabase db push --include-seed
```

Supabase recommends keeping remote schema changes in versioned migrations rather than making unmanaged production changes in the Dashboard. Use `supabase db push` for the migration chain and `supabase db reset` locally to verify reproducibility. citeturn0search1turn0search5

### Existing project warning

If the remote database already contains one of the old v0.13.0 Phase 4 migrations, **do not delete migration history and do not blindly replay migrations**. The new `0008_auth_architecture_extensions.sql` contains a reconciliation path for the older `editorial_reviews` shape, but you should first inspect the remote migration history:

```powershell
supabase migration list
```

Then:

```powershell
supabase db push --dry-run
supabase db push
```

Supabase documents `migration repair` for cases where migration history itself must be repaired; do that only after comparing the local and remote histories. citeturn0search13

## 5. Auth configuration

Enable the authentication method you intend to use in Supabase Auth settings. The current UI implements email/password sign-up and sign-in.

After signup, the database trigger provisions:

```text
profile
+
READER role
```

The browser then loads:

```text
session
user
profile
roles
permissions
```

Supabase Auth issues and refreshes JWT sessions, and authenticated database access is enforced with Postgres RLS. citeturn0search0turn0search3turn0search8

## 6. Role assignment

The canonical roles are:

```text
GUEST
READER
CONTRIBUTOR
TRANSLATOR
RESEARCHER
EDITOR
MODERATOR
ADMIN
SUPER_ADMIN
```

New users receive `READER` automatically.

For the first administrator, assign `ADMIN`/`SUPER_ADMIN` through a controlled Supabase administrative operation rather than putting a service-role credential in the browser.

## 7. Local validation

```powershell
npm run validate:ui
npm run validate:workspace
npm run prepare:static-build
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
```

The final two commands must be executed in an environment with the declared Node/npm versions and a successful `npm ci`.

## 8. Application smoke test

Check:

```text
/
/auth/
/account/
/dashboard/
/workspace/
/research/
/research-reader/mn10/
/editorial/
/admin/
/admin/users/
/admin/roles/
/admin/audit/
```

## 9. Role smoke test

### Anonymous

- public reader/search works
- dashboard shows authentication requirement
- editorial submission cannot be created
- admin areas show authentication/authorization requirement

### READER

- account/profile works
- workspace sync works
- dashboard works
- contribution submission remains unavailable until an elevated role is assigned

### CONTRIBUTOR / TRANSLATOR / RESEARCHER

- editorial submission can be created
- own submission is readable
- canonical corpus remains immutable from the contributor client

### EDITOR / MODERATOR

- reviewer permissions become visible according to assigned permission set
- editorial review operations remain RLS protected

### ADMIN / SUPER_ADMIN

- administrative entry points become visible according to permissions
- role assignment/audit permissions are database controlled

## 10. GitHub Pages deployment

GitHub Pages should use the existing Actions workflow and the static export output. GitHub's current Pages guidance recommends selecting **GitHub Actions** as the publishing source when using a custom workflow. citeturn0search9turn0search10

The public site remains static. Supabase is used as the browser-accessible authentication/database service; no server-only secret is required by the GitHub Pages deployment.
