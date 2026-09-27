# Phase 2.5 / v0.10.0 — PWA Manifest, Branding & SVG Assets

## Scope

This release extends the Phase 2.4.5 baseline without removing the existing research engine, corpus, workspace, review, citation, or static-export protections.

## Manifest

`apps/web/public/manifest.webmanifest` now includes the manifest properties requested from the project manifest reference:

- `lang` and `dir`
- `name`, `short_name`, `description`, `categories`
- `theme_color`, `background_color`
- relative `start_url`, `scope`, stable `id`
- `display`, `display_override`, `orientation`
- SVG `icons` including a maskable icon
- four project-specific shortcuts
- two SVG discovery screenshots
- `prefer_related_applications` and an empty related-applications registry until real native packages exist
- audio `file_handlers`
- `launch_handler`
- custom `protocol_handlers` for `web+dhamma:` and `web+tipitaka:`
- a `POST` `share_target` with text, URL, text-file, audio, and image/SVG fields

## Static hosting compatibility

GitHub Pages is a static host. The share target therefore uses the existing service worker to intercept its POST request, store received metadata/files in IndexedDB, and redirect the user to the static `/share-target/` page. No server endpoint is required.

The file handler uses `window.launchQueue` on supported installed-PWA browsers. The protocol handler opens a static receiver page and displays the received protocol URL. These APIs have limited browser availability and should be treated as progressive enhancements.

## Branding assets

All project branding assets introduced in this release are optimized SVG files:

- `assets/branding/logo.svg`
- `assets/branding/favicon.svg`
- `assets/branding/icon-192.svg`
- `assets/branding/icon-512.svg`
- `assets/branding/icon-maskable.svg`
- `assets/branding/banner.svg`
- `assets/branding/poster.svg`
- `assets/shortcuts/*.svg`
- `assets/screenshots/*.svg`

The same logo is exposed on the home surface and selected primary navigation bars, while the favicon and manifest icons provide browser/PWA branding.

## Build guard

`prepare-static-build.mjs` now verifies every manifest-referenced public asset and verifies the static pages required by the file/share/protocol handlers. It continues to remove stale `app/manifest.*` files and generated `.next/` output before build/typecheck.

## Version

- Release: `phase-2.5`
- Version: `0.10.0`
- Next.js: `16.3.6`
- React: `19.3.0`
- TypeScript: `6.0.3`
- Node.js: `24.21.0`
- npm: `12.1.0`
