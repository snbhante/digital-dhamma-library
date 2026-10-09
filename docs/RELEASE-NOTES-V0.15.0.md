# Digital Dhamma Library v0.15.0 — Release Notes

## User-facing changes
- Reorganized landing page navigation into a consistent masthead and primary navigation bar.
- Reduced the hero CTA cluster to three clear actions and added compact capability markers.
- Refined Account cards, form spacing, status messaging, Dashboard statistics/cards, and Advanced Research Reader layout.
- Improved responsive behavior for navigation, Dashboard grids, reader sidebar drawer, tabs, and parallel text panes.
- Account profile errors now surface Supabase/PostgREST message, code, details, and hint when available, with migration/policy guidance as fallback.
- Dashboard and Account now surface authorization-loading errors instead of silently showing zero roles/permissions.

## Maintenance and release hygiene
- Version bumped to 0.15.0 in root, web workspace, and package lock.
- Corrected the admin-users permission comparison to avoid unsafe TypeScript casts.
- Removed `.env.local` and generated/install/git directories from the distributable source archive.
- Added `SETUP AND GUIDLINE v0.15.0.md` with Supabase, local development, GitHub Actions/Pages, validation, troubleshooting, and release instructions.

## Important verification note
The source archive does not establish a live connection to the user's Supabase instance. Run `npm run validate:release`, inspect the browser's Network/Console, and verify migrations/RLS against the actual project before tagging a production release.
