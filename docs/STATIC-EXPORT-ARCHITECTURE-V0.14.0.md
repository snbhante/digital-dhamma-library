# Static Export Architecture — v0.14.0

## Why there is no `proxy.ts`

This project is configured with:

```ts
output: "export"
```

and is deployed to GitHub Pages. Static export produces static files; server-side API routes, Route Handlers, and Proxy/Middleware execution are not part of that deployment model.

Therefore the correct architecture is:

```text
Browser
  ↓
Supabase Auth
  ↓
JWT access token
  ↓
Supabase REST/PostgREST
  ↓
PostgreSQL
  ↓
RLS + permission functions
```

Do **not** run the `middleware-to-proxy` codemod in this static-hosted project. It would replace one unsupported server boundary with another unsupported server boundary.

If the project later moves to a Node.js server, Docker, or another runtime that supports Proxy, a separate server deployment profile may introduce `proxy.ts` for request-time routing/authentication. That must be a deliberate deployment architecture change, not a warning-suppression step.

## API and getStaticProps concern

The current project uses the App Router and contains no `getStaticProps` or `getStaticPaths` implementation. The public API described in `docs/api/openapi-outline.md` is a future API contract, not a deployed Next.js API route.

When a dedicated API is implemented, it should run outside the GitHub Pages static export (for example as Supabase Edge Functions, a separate Node service, or another supported API runtime).

## Security rule

UI gates such as `RoleGate` improve user experience but are not the security boundary. Every protected Supabase operation must remain protected by PostgreSQL RLS and permission checks.
