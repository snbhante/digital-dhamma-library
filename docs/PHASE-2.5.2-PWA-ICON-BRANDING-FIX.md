# Phase 2.5.2 / v0.10.2 — PWA Installed-App Branding Fix

## Problem observed

The browser installation dialog showed a generic/fallback `D` icon even though the project had a branded SVG logo. The same class of fallback could also appear for installed-app launcher/shortcut and window/title-bar surfaces.

## Root cause

The PWA manifest was advertising SVG files as the primary application icons. Although SVG is valid in several web contexts, installed-app icon pipelines—especially Chromium/Windows launcher and packaging paths—have broader and more predictable support when raster PNG icons are supplied at standard sizes.

## Changes

- Added PNG app icons at 32, 48, 96, 128, 180, 192, 256, and 512 pixels.
- Added a dedicated 512px PNG maskable icon.
- Added a multi-size `favicon.ico`.
- Converted the four PWA shortcut icons to PNG.
- Updated `manifest.webmanifest` so the installed-app icon set uses PNG rather than SVG.
- Updated Next.js metadata to use the raster favicon and Apple touch icon.
- Bumped the service-worker cache from `ddl-static-v0.10.1` to `ddl-static-v0.10.2` so existing clients can fetch the new assets.
- Kept the existing SVG logo/banner/poster assets for normal web branding and design use.

## Important browser/OS limitation

The website cannot directly draw inside the browser/OS-owned application title bar. The browser and operating system decide how the installed PWA icon is rendered there. This release supplies the icon resources in the formats and sizes that those installation/launcher pipelines can consume.

After deploying the new version, an already-installed PWA may retain its old cached icon. For a clean verification, uninstall the old installed app, refresh the site, confirm the new manifest/assets are loaded, and install the PWA again.

## Validation

The static build preparation script continues to verify every manifest-referenced public asset. The release should be checked locally with:

```powershell
npm ci
npm run typecheck
npm run build
```

Then verify the generated files:

```powershell
Test-Path apps\web\out\manifest.webmanifest
Test-Path apps\web\out\assets\branding\icon-192.png
Test-Path apps\web\out\assets\branding\icon-512.png
Test-Path apps\web\out\assets\branding\icon-maskable-512.png
Test-Path apps\web\out\assets\branding\favicon.ico
```

## Version

- Release: `phase-2.5.2`
- Version: `0.10.2`
- Next.js: `16.3.6`
- React: `19.3.0`
- TypeScript: `6.0.3`
- Node.js: `24.21.0`
- npm: `12.1.0`
