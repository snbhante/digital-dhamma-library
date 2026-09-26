# Phase 2.4 Guide

## Reader experience

- Open any work under `/read/<workId>/`.
- A thin progress bar appears at the top of the page.
- Progress is stored locally per work and updates as you scroll.
- The home page shows up to five recently opened works after you have visited them.

## Global shortcuts

- `Ctrl+K` on Windows/Linux or `Cmd+K` on macOS: open the command palette.
- `/`: open Research Search unless an input, textarea, or editable element is focused.
- `Esc`: close the command palette.

## Theme

Use the floating sun/moon control. The choice is stored under `ddl-theme` in browser localStorage.

## PWA/offline behavior

The deployed GitHub Pages site registers `public/sw.js`. The worker uses a network-first strategy and falls back to cached responses when the network is unavailable. It is intentionally conservative: it does not claim that every research resource is permanently available offline.

## Data continuity

Phase 2.4 does not change the Phase 2.3 workspace storage key, so existing local bookmarks, notes, saved searches, and collections remain readable.

## Release verification

```powershell
npm ci
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
```
