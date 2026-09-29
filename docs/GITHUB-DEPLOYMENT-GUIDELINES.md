# GitHub Deployment Guidelines

This guide details the process for deploying the Digital Dhamma Library to GitHub Pages. Because the project uses Next.js static export (`output: "export"`), no server-side execution (like SSR or Edge Middleware) is available at runtime. The workflow builds static HTML, CSS, and JS files which are then hosted by GitHub Pages.

## 1. Secrets and Variables Configuration

To enable Supabase authentication and Workspace 2.0 features in your GitHub Pages deployment, you must provide your Supabase connection details to the GitHub Actions workflow.

Since the application is statically exported, Next.js requires these variables at **build time** so it can embed them into the static client bundles.

1. Navigate to your GitHub repository in the browser.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Under the **Variables** tab (or **Secrets** tab, but Variables is acceptable for non-secret publishable keys), click **New repository variable**.
4. Add the following two variables:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
     - **Value:** Your Supabase project URL (e.g., `https://xxxxxx.supabase.co`)
   - **Name:** `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - **Value:** Your Supabase project's **anon/public** key (starts with `ey...`)

**⚠️ CRITICAL SECURITY WARNING:**
Never add your Supabase `service_role` key (the secret key) as a GitHub Secret or Variable. `NEXT_PUBLIC_` prefixed variables are embedded directly into the public JavaScript bundle. Using a secret key will expose your database with full admin privileges to the public internet.

## 2. GitHub Actions Workflow Configuration

Ensure your repository has a GitHub Actions workflow configured for Next.js static export (e.g., `.github/workflows/nextjs.yml`).

The workflow should pass these variables into the environment during the build step. Example snippet:

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    env:
      NEXT_PUBLIC_SUPABASE_URL: ${{ vars.NEXT_PUBLIC_SUPABASE_URL }}
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ${{ vars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      # ... node setup, npm ci, etc.
      - name: Build with Next.js
        run: npm run build
```

## 3. Pushing Changes

Before pushing to the `main` branch, ensure all static export rules are satisfied:

1. **No Middleware:** Edge middleware (`middleware.ts`) is not supported in `output: 'export'`.
2. **No Dynamic Server Functions:** Avoid `cookies()`, `headers()`, or `unstable_noStore()` in React Server Components. Use client-side data fetching and the Supabase browser client instead.
3. **Validate:** Run `npm run validate:workspace` and `npm run prepare:static-build` locally to catch static export issues early.

Once validated, commit and push your changes:

```bash
git add .
git commit -m "chore: release v0.12.1"
git push origin main
```

Upon pushing to the `main` branch, the GitHub Action will automatically trigger, build the static export using the provided `NEXT_PUBLIC_` variables, and deploy to your GitHub Pages URL.
