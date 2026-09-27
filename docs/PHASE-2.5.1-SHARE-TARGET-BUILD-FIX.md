# Phase 2.5.1 / v0.10.1 — Share Target Static Export Fix

## Problem

Next.js static export failed while prerendering `/share-target/` because the page Server Component consumed the App Router `searchParams` page prop. A GitHub Pages static export cannot satisfy request-time rendering requirements for that route.

## Fix

- `apps/web/app/share-target/page.tsx` is now a plain synchronous static Server Component.
- `apps/web/components/ShareTargetReceiver.tsx` reads `window.location.search` in `useEffect()`.
- The service worker continues to store the incoming `POST` payload in IndexedDB and redirects to `/share-target/?id=<record-id>`.
- The pre-build script rejects a regression where the share-target Server Component uses `searchParams` or becomes an async page.

## Why this works

The HTML shell can be fully prerendered at build time. The share record is inherently browser/request-specific, so it is loaded only after hydration in the Client Component. This preserves the static GitHub Pages architecture while retaining the PWA Share Target flow.

## Verification

Run:

```powershell
npm ci
npm run typecheck
npm run build
```

The build should reach the static export without the previous `Failed to prerender page "/share-target"` error.
