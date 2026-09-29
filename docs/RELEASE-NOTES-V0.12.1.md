# Digital Dhamma Library — v0.12.1

## Maintenance release

### Fixed

- **Static Export Compatibility:** Removed `apps/web/middleware.ts` and refactored `apps/web/app/todos/page.tsx` to be a Client Component using `createClient()` rather than a Server Component relying on `cookies()`. This restores full compatibility with Next.js static export (`output: 'export'`) required for GitHub Pages deployment.
- **TypeScript Narrowing:** Fixed the TypeScript `code 2` failure in `apps/web/components/AccountPanel.tsx`. `session` was narrowed to a non-null `AuthSession` for rendering, but the nested `save()` callback did not preserve that control-flow narrowing when calling `upsertProfile()`. The component now captures the authenticated session as `activeSession` after the render guard and passes that stable non-null value to `upsertProfile()`.
- **Hydration Mismatches:** Resolved a React hydration error in `apps/web/components/ParagraphResearchTools.tsx` by initializing the workspace state to an empty default during server-side/initial render and correctly syncing it with `localStorage` on mount via `useEffect`.
- **UI Overflow:** Improved display of long researcher emails or names in `AccountPanel.tsx` and `AuthStatus.tsx` by introducing `getFallbackName` in `lib/supabase.ts` and adding `overflow-wrap: anywhere` in `globals.css`.

### Preserved

- Supabase browser-side Auth HTTP API integration.
- `workspace_snapshots` migration and RLS policy.
- Existing local workspace storage key and local-first behavior.
- Deterministic local/cloud merge and background/manual synchronization.
- GitHub Pages static export.
- PWA, reader, research, responsive UI, and prior Phase 2 features.

### Verification

The following source-level release checks pass in the release workspace:

- `npm run validate:workspace` (Includes a new regression check for the AccountPanel narrowing fix).
- `npm run validate:ui`
- `npm run prepare:static-build`

