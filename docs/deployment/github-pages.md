# GitHub Pages Deployment

The public web app is configured for Next.js static export and GitHub Pages project-site deployment.

## Current repository

- Repository: `snbhante/digital-dhamma-library`
- Pages URL: `https://snbhante.github.io/digital-dhamma-library/`
- Branch: `main`

## Local verification

```powershell
node -v
npm -v
npm ci
npm run validate:data
npm run typecheck
npm run build
```

The production export is generated at `apps/web/out`.

## GitHub setup

1. Push the project to the `main` branch.
2. Open **Settings → Pages** in the repository.
3. Set **Build and deployment → Source** to **GitHub Actions**.
4. A push to `main` starts `.github/workflows/pages.yml`.
5. The workflow validates data, type-checks, builds the static export, uploads `apps/web/out`, and deploys it.

## Project-site base path

GitHub Pages serves this repository below `/digital-dhamma-library`. The workflow therefore builds with:

```text
NEXT_PUBLIC_BASE_PATH=/digital-dhamma-library
```

For local development the variable is normally empty, so the site runs at `http://localhost:3000`.

## Important limitation

GitHub Pages is a static hosting layer. Authentication, private user data, server-side authorization, database writes, and privileged administration should not be placed in the static site itself. Those features belong in the later Supabase/API application layer.

## Large files

Do not put large audio/video/scanned collections directly into the repository. Use an appropriate object store or release artifact strategy, while keeping metadata and provenance in the public dataset.
