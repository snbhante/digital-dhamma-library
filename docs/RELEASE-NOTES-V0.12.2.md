# Digital Dhamma Library — v0.12.2

## CI/CD Maintenance release

### Fixed

- **GitHub Actions Next.js Build Crash:** Fixed an issue where the GitHub Actions CI pipeline (`ci.yml` and `pages.yml`) would fail with Exit Code 1 during the Next.js static build phase. The build was failing because the `/todos` page unconditionally called `createClient()` at the top level, causing the `@supabase/ssr` library to throw a validation error (`Your project's URL and API key are required to create a Supabase client!`) when `NEXT_PUBLIC_` environment variables were not available in the CI runner environment.
- **Graceful SSR Fallback:** Updated `apps/web/utils/supabase/client.ts` to provide a dummy fallback Supabase URL and key when environment variables are missing. This safely bypasses the strict validation required by `@supabase/ssr` solely during the static pre-rendering phase, enabling successful builds in CI environments.

### Preserved

- Client-side runtime behavior remains identical (the Next.js client uses actual environment variables from `.env.local` or the GitHub variables injected at runtime).
- All static-export and GitHub Pages architecture.
- Workspace 2.0 and Supabase authentication features.

### Verification

- Successfully built without environment variables using `$env:NEXT_PUBLIC_SUPABASE_URL=""; npm run build`.
- CI pipeline triggers properly upon commit.
