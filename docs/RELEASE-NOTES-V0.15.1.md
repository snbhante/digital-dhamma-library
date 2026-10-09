# Digital Dhamma Library v0.15.1

## Fix: local environment credentials and release validation

- A local `.env.local` is allowed in the developer working tree.
- `.gitignore` excludes `.env.*` and explicitly permits `.env.example`.
- Architecture validation fails if actual `.env*` credentials are tracked by Git, rather than failing merely because a local file exists.
- Fixed stale expected-version messages and updated package/lock/manifest version metadata to 0.15.1.
- Release ZIPs must still exclude all real environment files.

This source-only validation does not prove the remote Supabase project or GitHub Pages deployment is reachable; run the full release checks and live smoke tests locally.
