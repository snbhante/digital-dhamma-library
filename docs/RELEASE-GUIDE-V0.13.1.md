# Digital Dhamma Library v0.13.1 — GitHub Push / Release Guide

## A. Prepare the release

```powershell
git status
git branch --show-current
node -v
npm -v
npm ci
npm run validate:ui
npm run validate:workspace
npm run prepare:static-build
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
```

Confirm that `apps/web/out/` exists after the build.

## B. Verify sensitive files are absent

Before commit:

```powershell
git status --short
Get-ChildItem -Force .env.local, apps\web\.env.local -ErrorAction SilentlyContinue
```

The release repository should contain `.env.example`, not real `.env.local` credentials.

## C. Inspect the diff

```powershell
git diff --check
git diff --stat
git status
```

## D. Commit

```powershell
git add .
git commit -m "Release v0.13.1 auth RBAC editorial foundation"
```

## E. Push the main branch

If the remote is already correct:

```powershell
git push origin main
```

If the current branch is not `main`:

```powershell
git branch -M main
git push -u origin main
```

If GitHub rejects the push because the remote contains commits that are not local, stop and inspect the histories before using any force option:

```powershell
git fetch origin
git log --oneline --graph --decorate --all -30
git diff --stat origin/main...HEAD
```

Prefer a normal merge/rebase and resolve conflicts explicitly. Do not force-push a shared `main` branch merely to make the histories match.

## F. Create the release tag

```powershell
git tag -a v0.13.1 -m "Digital Dhamma Library v0.13.1"
git push origin v0.13.1
```

## G. GitHub Release

On the repository's GitHub **Releases** page, create a release from tag `v0.13.1`.

Recommended release title:

```text
Digital Dhamma Library v0.13.1 — Auth / RBAC / Editorial Foundation
```

Release notes should include:

- canonical 9-role RBAC
- permission-based authorization
- automatic READER provisioning
- authenticated dashboard
- administration foundation
- contributor submission foundation
- editorial/media/audit database foundation
- static-export middleware removal
- typecheck/build fixes
- Phase 4–7 roadmap
- Supabase migration chain

GitHub recommends tag-based release management for versioned releases; semantic version tags make the release reference explicit. citeturn0search6turn0search14

## H. GitHub Pages verification

After pushing `main`:

1. Open **Settings → Pages**.
2. Confirm **Source = GitHub Actions**.
3. Open **Actions**.
4. Verify the CI workflow passes.
5. Verify the Pages deployment workflow passes.
6. Open the deployed site.
7. Test the PWA manifest and icons.
8. Test `/auth/`, `/account/`, `/dashboard/`, `/editorial/`, and `/admin/`.

GitHub's Pages documentation recommends checking workflow runs when diagnosing build/deployment failures. citeturn0search10

## I. Supabase production deployment

For the database side:

```powershell
supabase login
supabase link
supabase db push --dry-run
supabase db push --include-seed
```

Do not make unmanaged schema changes directly on production once migrations are the source of truth. Supabase explicitly recommends versioning schema changes and pushing migrations so local and remote migration history remain synchronized. citeturn0search1turn0search13

## J. Production security checklist

- [ ] No service-role key in Git
- [ ] No service-role key in `NEXT_PUBLIC_*`
- [ ] `.env.local` excluded from release
- [ ] RLS enabled on exposed application tables
- [ ] Anonymous access limited to intentionally public records
- [ ] Contributor writes restricted by permission/RLS
- [ ] Reviewer actions restricted by permission/RLS
- [ ] Role assignment restricted by `role.assign`
- [ ] Audit records protected
- [ ] Account suspension blocks effective permissions
- [ ] Canonical Git corpus remains immutable from the browser
- [ ] Supabase migration history matches the repository

Supabase's RLS guidance emphasizes that RLS and database grants work together; a policy alone does not necessarily remove an underlying grant. citeturn0search8

## K. Important architecture boundary

The GitHub Pages application is the public/static client. If a future feature requires:

- service-role access
- secret API credentials
- privileged aggregation
- server-side AI calls
- private source processing
- payment/subscription logic
- protected administrative exports

deploy that feature behind a separate server/API/Edge Function boundary. Never move the secret into the static browser bundle.
