# Phase 2.6 / v0.11.0 — Responsive Reader & Contextual Paragraph Actions

## Scope

This release improves the existing local-first research workspace and reader experience without changing canonical text IDs or discarding existing browser-local workspace data.

## Responsive UI

The public UI now has explicit layout behavior for:

- large desktop (`1440px+`)
- desktop / laptop (`1024px–1439px`)
- tablet (`768px–1023px`)
- mobile (`480px–767px`)
- small mobile (`360px–479px`)
- compact mobile (`359px` and below)

The layout uses fluid typography, content-width limits, touch-sized controls, safe-area-aware overlays, reduced-motion support, and stacked mobile navigation/actions.

## Paragraph actions

Paragraph controls are now contextual instead of occupying the reader header permanently.

- Pointer devices: hovering a paragraph action control reveals the action panel.
- Keyboard users: focus reveals the action panel.
- Touch/mobile users: tapping the paragraph or the Actions trigger reveals the panel.
- Clicking links/buttons inside a paragraph does not accidentally toggle the paragraph action state.
- Only the active paragraph needs to remain open on touch layouts.

The action panel contains the existing citation controls plus local bookmark and note actions.

## Note overlay

Paragraph notes now open in a modal overlay instead of an inline editor.

Features:

- private research note context
- automatic focus on the textarea
- Escape-to-close
- backdrop click to close
- save/update
- delete existing note
- cancel without saving
- mobile-safe sizing with `dvh` and safe-area padding
- body scroll lock while the dialog is open
- accessible `role="dialog"` and `aria-modal="true"`

## Data continuity

The existing workspace storage key is intentionally retained. Existing bookmarks, notes, saved searches, and collections remain available in the browser after the upgrade.

## Validation

`npm run validate:ui` verifies the responsive breakpoint matrix, paragraph action component, protected paragraph click handling, note dialog semantics, and Escape handling.
