# v0.13.1 Validation Report

## Automated checks completed in the provided build workspace

| Check | Result |
|---|---|
| JSON/package metadata parse | PASS |
| UI validation | PASS |
| Workspace validation | PASS |
| PWA/static preparation | PASS |
| Research index generation | PASS |
| Data validation | PASS |
| Git whitespace/error check | PASS |
| Duplicate migration filename check | PASS |
| Release env hygiene | PASS |
| Static-export middleware removal | PASS |
| Forbidden service-role pattern scan | PASS for project runtime source; documentation intentionally contains security guidance text |

## Typecheck/build limitation

The supplied environment currently runs:

```text
Node v22.16.0
npm 10.9.2
```

while the project declares:

```text
Node >=24.21.0 <25
npm >=12.1.0
```

The initial `npm ci` attempt timed out and left an incomplete `node_modules` tree. Consequently, a trustworthy full `npm run typecheck` and `npm run build` could not be executed in this environment. Running a global TypeScript compiler produced only missing dependency/type-definition diagnostics caused by the incomplete installation; it did not reproduce the original missing-export errors after the source patch.

The repository therefore includes the exact release commands that must be run on Node 24.21.x/npm 12.1.x:

```bash
npm ci
npm run validate:ui
npm run validate:workspace
npm run prepare:static-build
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
```

## Original typecheck failure fixed in source

The previous build diagnostics reported missing exports from `apps/web/lib/supabase.ts`:

- `createEditorialSubmission`
- `getUserRoles`
- `UserRole`

v0.13.1 implements and exports the canonical Auth/RBAC functions and types rather than suppressing the errors.

## Database validation requirement

The migration chain should be validated on a disposable/local Supabase database before production deployment:

```bash
supabase db reset
supabase db push --dry-run
supabase db push
```

Then run RLS allow/deny tests with anonymous, READER, CONTRIBUTOR/RESEARCHER, EDITOR/MODERATOR, and ADMIN/SUPER_ADMIN accounts.
