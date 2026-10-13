# Digital Dhamma Library v0.15.2

## Supabase profile and GitHub Pages configuration fix

- Added migration `0010_auth_profile_backfill.sql` to ensure profile fields required by the browser app exist, backfill missing profiles for existing Auth users, and ensure a baseline `READER` assignment without elevating privileges.
- Reasserted the Auth signup trigger for future profiles and baseline reader assignments.
- Removed dummy Supabase URL/key fallback from the secondary browser client factory; missing configuration now produces an actionable error.
- Added GitHub Actions fail-fast validation for the public Supabase URL and publishable key before building the GitHub Pages artifact.
- Bumped root/workspace/lockfile version metadata to `0.15.2`.
- Added the root-level `SETUP&GUIDLINE.md` A–Z guide covering Supabase setup, migration, local development, GitHub Pages, validation, troubleshooting, and release workflow.

## Validation boundary

This release source has been statically reviewed. Live Supabase and GitHub Pages verification requires running the documented commands and smoke tests against the target project. Do not claim the live integration passed until those tests complete.
