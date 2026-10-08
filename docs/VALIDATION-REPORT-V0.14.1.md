# Validation Report — v0.14.1

## Source audit findings

| Finding | Severity | Resolution |
|---|---|---|
| Duplicate active migration number `0007` | Release blocker | Removed incompatible draft from active chain; retained canonical foundation as 0007 |
| 0007 legacy migration conflicts with existing `profiles` schema | Release blocker | Archived; canonical migration chain restored |
| `.env.local` shipped in release ZIP | Security/release blocker | Removed from release tree |
| Git repository metadata shipped in ZIP | Release hygiene | Removed |
| Hand-rolled Auth REST + localStorage session handling | Architecture risk | Replaced with Supabase browser client/Auth state listener |
| Dummy Supabase URL/key fallback | Runtime risk | Removed |
| RBAC permission matrix only seeded SUPER_ADMIN | Functional/security defect | Added complete nine-role matrix |
| RBAC catalog tables lacked RLS | Security defect | RLS + read-only client policies added |
| Browser role assignment had no secure operation | Missing feature | SECURITY DEFINER admin RPCs added |
| Account lifecycle operation incomplete | Missing feature | Admin status RPC added |
| Editorial review status mutation lacked database transition guard | Integrity defect | Review RPC added |
| `/todos/` sample route queried an undefined table | Stale feature | Removed |
| Middleware/server Supabase artifacts remained | Static architecture drift | Removed |

## Source-level validation

Expected:

```text
validate:architecture PASS
validate:ui PASS
validate:workspace PASS
prepare:static-build PASS
build:research-index PASS
validate:data PASS
```

After dependencies are installed successfully:

```text
typecheck
build
npm audit --audit-level=high
```

must also pass before release.

## Network-dependent limitation

The final package cannot honestly claim a successful live `npm ci`, `npm run typecheck`, or `npm run build` until the user's Windows machine or CI runner completes dependency installation from the npm registry.

The previous `EINTEGRITY` error is consistent with a corrupted npm cache/archive and should be resolved by the documented cache-clean procedure.

## Security boundary

No `service_role` or `sb_secret_` key is required by the GitHub Pages frontend. Supabase publishable keys are intended for public client applications; RLS is the actual data-access boundary.
