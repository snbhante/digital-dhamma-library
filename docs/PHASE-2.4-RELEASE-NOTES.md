# Phase 2.4.2 — Reader Polish, Manifest Fix & Citation UI

Version: `0.9.2`

Phase 2.4.2 keeps the complete Phase 2.4 baseline and fixes the reported manifest, reader-theme, and paragraph citation-action issues without changing canonical text IDs or the local research workspace schema.

## Changes in 2.4.1

- Replaced the public manifest file with the Next.js `app/manifest.ts` metadata convention and an explicit base-path-aware metadata link. This prevents `/manifest.webmanifest` 404s when the app is deployed under GitHub Pages.
- Added explicit **Light / Dark** controls to the reader toolbar and synchronized them with the global theme preference through the `ddl-theme-changed` event.
- Made reader surfaces theme-aware: the reader toolbar and translation text now use CSS variables rather than hard-coded light-theme colors.
- Replaced the five inline citation-format buttons in each paragraph header with an accessible compact **Citation ▾** dropdown.

## Phase 2.4 baseline features

- Installable PWA metadata and service worker for offline-friendly caching.
- Reading progress bar on every work reader.
- Per-work reading progress saved locally in the browser.
- Local recent-reading history with a “Continue reading” section on the home page.
- Global command palette with `Ctrl+K` / `Cmd+K`.
- `/` keyboard shortcut to open Research Search when focus is not inside a form field.
- Persistent light/dark theme preference.
- Keyboard-accessible skip-to-content link.
- Responsive command palette and mobile-friendly global controls.
- Preserves all Phase 2.3 bookmarks, notes, saved searches, collections, export/import, review tools, research indexes, citations, morphology, alignments, edition witnesses, dictionary, and source/provenance layers.

## Static-hosting boundary

The service worker is an enhancement, not a replacement for the GitHub Pages build. The canonical corpus remains Git-controlled JSON. Personal research data remains browser-local in this release. Authentication and server-side synchronization remain a future milestone.

## Verification boundary

Data validation, research-index generation, static-route audits, package/version consistency, and source audits should be run before release. A full dependency installation and production build must be verified in the user's Node.js `24.21.0` / npm `12.1.0` environment because CI/container network availability may differ.
