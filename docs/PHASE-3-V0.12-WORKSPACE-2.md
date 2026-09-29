# Phase 3 / v0.12.0 — Workspace 2.0

## Goal

Connect the existing browser-local research workspace to optional authenticated cloud persistence without changing the canonical Git-versioned Buddhist corpus or breaking the GitHub Pages static export.

## Features

- Supabase email/password sign-up and sign-in.
- Account/profile management.
- Local-first workspace continuity.
- Private per-user workspace snapshot in Supabase.
- RLS policy limiting snapshot access to the authenticated owner.
- Local/cloud merge when a user first signs in on a browser.
- Debounced synchronization after local workspace changes.
- Manual “Sync now” control.
- Workspace v2 JSON export/import.
- Explicit offline/local-first behavior when Supabase is not configured.

## Static-hosting design

The public site remains a static Next.js export. No Next.js server route, server action, or request-time authentication dependency was added. Authentication uses the browser-facing Supabase Auth HTTP API with the project's publishable/anon key. This keeps the GitHub Pages deployment compatible with the existing `output: "export"` architecture.

For a full SSR deployment in a future hosting environment, Supabase's current guidance uses `@supabase/ssr`, cookies, and a Next.js 16 `proxy.ts` session-refresh layer. That architecture is intentionally deferred because GitHub Pages is the current public deployment target.

## Environment

Copy `.env.example` to `.env.local` and set:

```text
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Never expose a service-role/secret key in a `NEXT_PUBLIC_*` variable.

## Database

Run migrations through Supabase SQL Editor or the Supabase CLI in order. Phase 3 adds:

`supabase/migrations/0006_phase_3_workspace_2.sql`

The migration creates `public.workspace_snapshots` with one private snapshot row per user and RLS policies that require `auth.uid() = user_id`.

## Data continuity

The browser storage key from the previous workspace release is preserved. Signing in does not delete local data. Instead, the local workspace and any existing cloud snapshot are merged, then the merged state is uploaded.

## Research integrity boundary

The snapshot table stores user-generated workspace state only. It does not mutate `data/corpus.json`, research indexes, source records, editions, translations, dictionary data, or canonical paragraph IDs.


## GitHub Pages build variables

Because `NEXT_PUBLIC_*` values are embedded during the static build, add these repository Variables in GitHub under **Settings → Secrets and variables → Actions → Variables**:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The Pages workflow passes these variables into the Next.js build. Do not add a service-role/secret key to the workflow or any `NEXT_PUBLIC_*` variable.

## v0.12.1 maintenance fix

The Workspace 2.0 account screen had a strict TypeScript control-flow issue: `session` was narrowed by a render-time guard, but the nested asynchronous `save()` function could not safely retain that narrowing when passing the value to `upsertProfile()`. The fix captures the already-authenticated session in `activeSession` immediately after the guard and uses that value inside `save()`.

This is a compile-time fix only. It does not change the Supabase API contract, RLS policy, browser session storage, workspace merge behavior, or static GitHub Pages deployment architecture.
