# Phase 2.4.4 — Static PWA Manifest Build Fix

Version: `0.9.4`

## Problem

The Phase 2.4.3 baseline contained both:

- `apps/web/app/manifest.ts` — a Next.js metadata-route manifest; and
- `apps/web/public/manifest.webmanifest` — a static public manifest.

With `output: "export"` in Next.js 16.3.6, the metadata route was being collected as `/manifest.webmanifest` during production export. The build failed while collecting page data for that route.

The project already links to the public manifest from the root layout, so the metadata-route manifest was unnecessary and created a duplicate route boundary.

## Fix

Phase 2.4.4:

1. Removes `apps/web/app/manifest.ts`.
2. Keeps `apps/web/public/manifest.webmanifest` as the single canonical PWA manifest.
3. Uses relative `start_url` and `scope` (`./`) so the same manifest works at the local root and under the GitHub Pages base path.
4. Keeps the explicit base-path-aware manifest link in `app/layout.tsx`.
5. Bumps the service-worker cache namespace to `ddl-static-v0.9.4`.
6. Removes generated `.next/` and `out/` artifacts from the release archive.
7. Retains the Phase 2.4.3 TypeScript 6.0.3 + `next typegen && tsc --noEmit` fix.

## Expected production build

```powershell
npm ci
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
```

The build should no longer attempt to collect `/manifest.webmanifest` as a Next.js metadata route.

## GitHub Pages

The generated static site remains in:

```text
apps/web/out/
```

The GitHub Actions workflow uploads that directory to GitHub Pages.

## Important

Do not recreate `apps/web/app/manifest.ts` while `apps/web/public/manifest.webmanifest` is being used as the static manifest. The two approaches target the same public manifest URL and are intentionally not combined in this static-export configuration.
