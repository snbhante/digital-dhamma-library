# Phase 2.3 — Personal Research Workspace

Version: `0.8.0`

Phase 2.3 adds a static-hosting-compatible, local-first personal research workspace while preserving the canonical Git-controlled corpus and the Phase 2.2 review/provenance layers.

## Features

- paragraph bookmarks from the reader
- private paragraph notes
- saved advanced searches
- personal collections foundation
- workspace JSON export/import
- local workspace reset
- `/workspace/` dashboard
- shared workspace storage contract in `apps/web/lib/workspace.ts`
- Supabase persistence migration for user collections and bookmark membership
- explicit local-first/static-hosting integrity notice

## Data integrity

Workspace data is not mixed into canonical corpus JSON. The browser stores it under a versioned localStorage key. Export/import uses a JSON object with bookmarks, notes, saved searches, and collections.

The existing Supabase `bookmarks`, `notes`, `saved_searches`, and `reading_history` tables remain the intended authenticated persistence layer. Phase 2.3 adds `user_collections` and `collection_bookmarks` for collection organization.

## Static export compatibility

No server route or dynamic API endpoint is required. The feature works on GitHub Pages and can later be synchronized after authentication is introduced.

## Verification

Run:

```bash
npm ci
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
```
