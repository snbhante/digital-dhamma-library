# Phase 2.3 Guide

Phase 2.3 introduces the personal research workspace.

## Routes

- `/workspace/` — bookmarks, notes, saved searches, and collections
- `/read/[workId]/` — save or annotate individual paragraphs
- `/search/` — save the current research query

## Local-first model

The static GitHub Pages build cannot safely persist user data on the server. Therefore Phase 2.3 stores workspace state in browser localStorage under:

`digital-dhamma-library:workspace:v0.8.0`

Users can export the state as `digital-dhamma-library-workspace.json` and import it on another browser.

## Authenticated roadmap

The Supabase schema already has user bookmarks, notes, saved searches, and reading history. Phase 2.3 adds collections. A future authenticated client can synchronize the same stable target IDs to Supabase without changing canonical corpus records.

## Research integrity

Local notes and bookmarks are personal research aids. They are not public scholarly annotations and do not alter the source corpus, edition records, translations, or review queue.
