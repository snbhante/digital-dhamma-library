# Phase 2.4 — Research Experience & Offline Reader

Version: `0.9.0`

Phase 2.4 merges the complete Phase 2.3 baseline and adds a static-hosting-friendly reader experience without changing canonical text IDs or the local research workspace schema.

## New features

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
