# GitHub Pages Deployment

The public web app is configured for static export.

## Repository setup

1. Create a GitHub repository.
2. Push this project to the `main` branch.
3. In repository settings, open Pages.
4. Select GitHub Actions as the build/deployment source.
5. Push to `main`.

The workflow builds `apps/web/out` and deploys that artifact.

## Important limitation

GitHub Pages is a static hosting layer. Authentication, private user data, server-side authorization, database writes, and privileged administration should not be placed in the static site itself.

For the application layer, use a backend/database service such as Supabase or a separate API service.

## Large files

Do not put large audio/video/scanned collections directly into the repository. Use an appropriate object store or release artifact strategy, while keeping metadata and provenance in the public dataset.
