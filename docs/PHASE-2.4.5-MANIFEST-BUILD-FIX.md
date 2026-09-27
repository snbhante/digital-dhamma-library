# Phase 2.4.5 — Manifest Build Fix Hardening

Version: `0.9.5`

## What the screenshot revealed

The production build was still failing at:

```text
Failed to collect page data for /manifest.webmanifest
```

The important detail is the generated path:

```text
apps/web/.next/server/app/manifest.webmanifest
```

That indicates Next.js was still discovering an App Router metadata manifest route. In the previous release, `apps/web/app/manifest.ts` was removed from the release archive. However, copying a ZIP over an existing checkout does not delete files that existed only in the older checkout. Therefore an old `apps/web/app/manifest.ts` could remain on disk and continue to generate `/manifest.webmanifest` during the build.

Next.js treats `app/manifest.ts` as a special metadata file/route. This project instead uses the static file `apps/web/public/manifest.webmanifest` as its canonical GitHub Pages asset.

## Phase 2.4.5 fix

The release keeps the public manifest and adds a deterministic pre-build cleanup step:

```text
scripts/prepare-static-build.mjs
```

The script:

1. Removes stale `apps/web/app/manifest.*` files left by older releases.
2. Removes `apps/web/.next/` so generated output from an older build cannot survive into the new build.
3. Verifies that `apps/web/public/manifest.webmanifest` exists.
4. Parses the manifest as JSON.
5. Verifies the required PWA fields (`name`, `short_name`, `start_url`, `scope`, `display`).
6. Prints a clear success message before type generation/build.

The root scripts now run this preparation step automatically:

```text
npm run typecheck
npm run build
```

The web workspace `typecheck` and `build` scripts also run it directly, so both root and workspace workflows are protected.

## Canonical manifest architecture

```text
apps/web/public/manifest.webmanifest
        │
        └── canonical static PWA manifest

apps/web/app/manifest.*
        │
        └── intentionally absent; stale copies are removed automatically
```

The root layout continues to expose the manifest through the Metadata API with the GitHub Pages base path:

```text
manifest: `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/manifest.webmanifest`
```

## Why this is different from Phase 2.4.4

Phase 2.4.4 relied on the old metadata-route file being physically deleted from the user's checkout. That is not guaranteed when users overlay a ZIP archive on an existing project.

Phase 2.4.5 makes the migration safe: even if an old `app/manifest.ts` is still present when the user starts, `npm run typecheck` or `npm run build` removes it before Next.js type generation/build begins.

## Verification

Recommended Windows verification:

```powershell
npm ci
npm run typecheck
npm run build
```

Before `next build` starts, the terminal should show:

```text
Static build preparation passed: public/manifest.webmanifest is the canonical PWA manifest.
```

If an old manifest file is present, it should also report its removal, for example:

```text
Removed stale Next.js manifest route: apps/web/app/manifest.ts
```

The production build should no longer collect `/manifest.webmanifest` as an App Router metadata route.
