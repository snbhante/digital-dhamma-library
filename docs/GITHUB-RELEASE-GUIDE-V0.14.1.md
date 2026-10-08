# GitHub Push & Release — v0.14.1

## 1. Verify toolchain

```powershell
node -v
npm -v
git --version
```

Target:

```text
Node 24.21.x
npm 12.1.x
```

## 2. Install

```powershell
npm ci
```

If Windows reports `EINTEGRITY`, follow:

`docs/NPM-WINDOWS-INTEGRITY-TROUBLESHOOTING.md`

## 3. Configure local Supabase

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

## 4. Validate source

```powershell
npm run validate:architecture
npm run validate:ui
npm run validate:workspace
npm run prepare:static-build
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
npm audit --audit-level=high
```

Or:

```powershell
npm run validate:release
```

## 5. Link Supabase

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list
supabase db push --dry-run
supabase db push
```

## 6. Configure GitHub Pages variables

Repository:

`Settings → Secrets and variables → Actions → Variables`

Create:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

The Pages workflow supplies:

```text
NEXT_PUBLIC_BASE_PATH=/digital-dhamma-library
```

Do not add a Supabase secret/service-role key.

## 7. Git checks

```powershell
git status
git diff --check
git grep -n "service_role\|sb_secret_" -- ':!docs/archive'
```

The release archive must not contain:

```text
.env.local
.git/
node_modules/
.next/
```

## 8. Commit

```powershell
git add .
git commit -m "Release v0.14.1 Phase 4.3 auth RBAC hardening"
```

## 9. Sync before push

```powershell
git fetch origin
git pull --rebase origin main
```

Resolve conflicts if any, then:

```powershell
git push origin main
```

## 10. Tag the release

```powershell
git tag -a v0.14.1 -m "Digital Dhamma Library v0.14.1"
git push origin v0.14.1
```

## 11. GitHub Pages

The Pages workflow builds:

```text
apps/web/out
```

with:

```text
NEXT_PUBLIC_BASE_PATH=/digital-dhamma-library
```

GitHub:

`Settings → Pages`

Set:

```text
Source: GitHub Actions
```

Then monitor:

`Actions → Deploy Digital Dhamma Library`

## 12. Post-release checks

Open:

```text
https://snbhante.github.io/digital-dhamma-library/
```

Check:

- home
- works
- reader
- dictionary
- search
- research reader
- auth
- account
- workspace
- editorial submission
- reviewer queue
- admin
- PWA manifest
- install icons

Then test an authenticated Supabase account and confirm that RLS prevents cross-user workspace access.

## 13. Database release discipline

Never edit production schema manually without recording the change as a migration.

Future migration:

```powershell
supabase migration new descriptive_name
```

Then:

```powershell
supabase db push --dry-run
supabase db push
```
