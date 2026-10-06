# Digital Dhamma Library v0.14.0 — Validation Report

## Source-level and deterministic checks

| Check | Result |
|---|---|
| Architecture validation | PASS |
| UI validation | PASS |
| Workspace validation | PASS |
| Static build preparation | PASS |
| Research index generation | PASS |
| Data validation | PASS |
| Duplicate migration-number check | PASS |
| Deprecated root middleware/proxy scan | PASS |
| `getStaticProps` / `getStaticPaths` scan | PASS |
| Service-role source scan | PASS |
| Release environment hygiene | PASS |
| Package-lock consistency (`npm ci --dry-run`) | PASS |

## Security update

The application was upgraded from Next.js 16.3.6 to 16.3.8. Next.js 16.3.8 is the current stable 16.3 release and includes security fixes including a high-severity SSRF issue in image optimization. The project does not use `images.remotePatterns`, and images are configured as unoptimized for static GitHub Pages output, but the framework is still kept on the patched release.

## Middleware / Proxy decision

The project uses `output: "export"` and GitHub Pages. Next.js documents Proxy/Middleware as unsupported for static export. Therefore this release removes the root `middleware.ts` and the unused Supabase middleware helper rather than migrating them to `proxy.ts`.

Authentication remains browser-side Supabase Auth. Authorization remains PostgreSQL RLS + permission functions. A future server deployment may introduce Proxy as a separate deployment profile.

## Typecheck / production build limitation in this execution environment

A complete dependency installation could not be completed in this execution environment because the environment uses:

```text
Node v22.16.0
npm 10.9.2
```

while the project declares:

```text
Node >=24.21.0 <25
npm >=12.1.0
```

The environment also could not reliably reach the npm registry; `npm ci --offline` stopped because an uncached tarball (`undici-types`) was unavailable, and a subsequent online install timed out.

Therefore this report does **not** claim a full `npm run typecheck` or `npm run build` pass from this environment. The source-level diagnostics that were present in the supplied v0.13.0 build artifact were fixed, including the missing `createEditorialSubmission`, `getUserRoles`, and `UserRole` exports.

## Required final verification on the user's machine / CI

Use Node 24.21.x and npm 12.1.x:

```powershell
npm ci
npm run validate:release
```

`validate:release` includes:

```text
architecture validation
UI validation
workspace validation
static build preparation
research-index generation
data validation
npm audit --audit-level=high
typecheck
production build
```

## Supabase validation

Before production migration, use a disposable/local Supabase project:

```powershell
supabase db reset
supabase db push
```

Then test anonymous, READER, CONTRIBUTOR/RESEARCHER, EDITOR/MODERATOR, ADMIN and SUPER_ADMIN authorization boundaries.
