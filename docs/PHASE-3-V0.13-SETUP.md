# v0.13.0 Setup & Verification

## 1. Clean install

```powershell
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\.next -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force apps\web\out -ErrorAction SilentlyContinue
npm ci
```

## 2. Environment

`.env.local`:

```env
NEXT_PUBLIC_BASE_PATH=/digital-dhamma-library
NEXT_ALLOWED_DEV_ORIGINS=192.168.1.13
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Never place a service-role or secret Supabase key in a `NEXT_PUBLIC_*` variable.

## 3. Supabase migrations

Run:

- `0001_core.sql`
- `0002_research_engine.sql`
- `0003_phase_2_1_research.sql`
- `0004_phase_2_2_research_review.sql`
- `0005_phase_2_3_personal_workspace.sql`
- `0006_phase_3_workspace_2.sql`
- `0007_phase_4_editorial_foundation.sql`

## 4. Validation

```powershell
node -v
npm -v
npm ls next typescript
npm run validate:workspace
npm run validate:ui
npm run prepare:static-build
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
```

Expected runtime baseline:

- Node 24.21.x
- npm 12.1.x
- Next.js 16.3.6
- TypeScript 6.0.3

## 5. Local test

```powershell
npm run dev
```

Check:

- `/`
- `/search/`
- `/research/`
- `/research-reader/mn10/`
- `/compare/mn10/`
- `/dictionary/metta/`
- `/editorial/`
- `/knowledge-graph/`
- `/media/`
- `/api-reference/`
- `/workspace/`
- `/account/`

## 6. Editorial test

Without Supabase/role configuration, the editorial page must remain readable but must not allow an unauthenticated submission.

With an authenticated account assigned `CONTRIBUTOR`, `TRANSLATOR`, or `RESEARCHER`, a submission should create a `SUBMITTED` row in `editorial_submissions`.

With an `EDITOR`, `MODERATOR`, `ADMIN`, or `SUPER_ADMIN` role, reviewer-only actions are permitted by RLS where implemented.
