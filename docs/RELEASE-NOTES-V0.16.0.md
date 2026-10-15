# Digital Dhamma Library v0.16.0 — Reliability and Research UX

## Highlights

- Simplified the home-page search to one Search action; advanced filters remain on the dedicated Search page.
- Added a Search Settings modal for Field, Collection, Type, Language, and result Limit.
- Presented Save this search in a modal with a name field and current-filter summary.
- Added profile avatar upload using the Supabase Storage `avatars` bucket, restricted to image files up to 3 MB.
- Added a gender preference in profile preferences and gender-aware default avatars when no picture is uploaded.
- Profile fields are read-only by default and enter edit mode through a toggle.
- Account page now clearly separates assigned roles from effective permission keys.
- Global account access is represented by a profile avatar link rather than a display-name link.
- Dashboard identity now includes an avatar link and the stats/cards spacing is improved.
- Added migration `20261015093600_profile_avatar_storage.sql` and updated architecture validation for v0.16.0.
- Added a phased roadmap and updated setup/release guidance.

## Supabase migration required

Apply `supabase/migrations/20261015093600_profile_avatar_storage.sql` to the intended Supabase project. It creates/configures the public `avatars` Storage bucket and adds policies so authenticated users can write only within their own UUID-named folder. Public read access is intentional for public profile imagery. Review this policy model before using it for private images.

## Validation status

This source package must be validated on the target development machine. A successful local build does not prove the connected Supabase project's migrations, Auth redirects, RLS, or Storage policies are correct. Record actual command results in `docs/validation/VALIDATION-REPORT-V0.16.0.md` before publishing a release.

## Compatibility and boundaries

- GitHub Pages remains a static frontend deployment.
- Supabase URL and publishable key are public client configuration; secret/service-role keys must never be shipped to the browser.
- Avatar images are public because the bucket is public. Do not upload sensitive/private images.
- Existing user gender preference is stored in `profiles.preferences.gender`; no new `profiles.gender` column is required.
