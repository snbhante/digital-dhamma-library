# Digital Dhamma Library — v0.12.3

## CI/CD Maintenance release

### Fixed

- **GitHub Actions Secret Configuration:** Synchronized the CI build workflow (`.github/workflows/ci.yml`) so that it is provided with the identical `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` repository variables as the `pages.yml` deployment workflow.
- This ensures that the CI environment mirrors the production static export configuration exactly during pull requests and main branch tests.

### Preserved

- The graceful dummy fallback in `utils/supabase/client.ts` remains active as a safety net in case repository variables are ever deleted or a local developer tests a production build without an `.env.local` file.
- `output: "export"` GitHub Pages architecture remains unchanged.
- All workspace snapshot capabilities and local storage rules are preserved.
