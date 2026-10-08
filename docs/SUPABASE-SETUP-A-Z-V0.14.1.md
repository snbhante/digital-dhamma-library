# Supabase A–Z Setup — Digital Dhamma Library v0.14.1

This guide is specifically for the GitHub Pages + Supabase architecture used by this release.

## 1. Create the Supabase project

1. Open the Supabase Dashboard.
2. Create a new project.
3. Suggested project name: `digital-dhamma-library`.
4. Save the database password securely.
5. Choose a region appropriate for your users.

## 2. Get the two browser-safe values

From the project's **Connect** panel or **Settings → API Keys**, obtain:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

The publishable key is intentionally public in a browser application. It does not bypass RLS.

Never place these in the browser:

```text
sb_secret_...
service_role
```

Do not put a secret key in any `NEXT_PUBLIC_*` variable.

## 3. Configure local environment

From the repository root:

```powershell
Copy-Item .env.example .env.local
notepad .env.local
```

Set:

```env
NEXT_PUBLIC_BASE_PATH=
NEXT_ALLOWED_DEV_ORIGINS=localhost,127.0.0.1
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

For GitHub Pages, CI changes `NEXT_PUBLIC_BASE_PATH` to:

```text
/digital-dhamma-library
```

Never commit `.env.local`.

Check:

```powershell
git check-ignore .env.local
```

## 4. Install Supabase CLI

Verify:

```powershell
supabase --version
```

If it is not installed, install the current Supabase CLI using the official installation method for Windows.

## 5. Authenticate CLI

```powershell
supabase login
```

## 6. Link the repository to the project

```powershell
supabase link --project-ref YOUR_PROJECT_REF
```

Then:

```powershell
supabase status
supabase migration list
```

## 7. Inspect migrations before applying

This release expects:

```text
0001 ... 0009
```

Run:

```powershell
supabase db push --dry-run
```

On a brand-new project, all nine migrations should be pending.

## 8. Apply schema

```powershell
supabase db push
```

Do not use a production database reset.

## 9. Verify the schema

In Supabase Dashboard:

- Table Editor
- Authentication
- SQL Editor

Expected security-critical tables include:

```text
profiles
roles
permissions
role_permissions
user_roles
workspace_snapshots
editorial_submissions
editorial_reviews
media_assets
audit_logs
```

## 10. Auth settings

In **Authentication → Providers**, enable Email.

For Google/GitHub providers, configure them only after the base email flow works.

## 11. Auth URL configuration

For local development use:

```text
http://localhost:3000
```

For GitHub Pages use:

```text
https://snbhante.github.io/digital-dhamma-library/
```

Add the exact application URLs required by the enabled Auth provider and Supabase redirect configuration.

## 12. First account

Open the local app:

```powershell
npm run dev
```

Then:

```text
http://localhost:3000/auth/
```

Create an account.

If email confirmation is enabled, confirm the email before signing in.

The database trigger creates:

- a `profiles` row
- the baseline `READER` role

## 13. Creating the first administrator

Do not expose a secret key in the app.

For the first bootstrap administrator, use the Supabase SQL Editor while signed in as the project owner. Find the user's UUID in Authentication → Users, then run:

```sql
insert into public.user_roles (user_id, role_id, assigned_by)
select
  'USER_UUID_HERE'::uuid,
  r.id,
  'USER_UUID_HERE'::uuid
from public.roles r
where r.name = 'SUPER_ADMIN'
on conflict do nothing;
```

Replace `USER_UUID_HERE` with the real Auth user UUID.

After this, sign out and sign in again so the browser reloads authorization.

## 14. Why the app does not use `proxy.ts`

GitHub Pages provides static files only. Request-time Next.js Proxy/Middleware requires a server runtime.

Therefore this release uses:

```text
Browser Supabase client
+
Supabase Auth
+
PostgreSQL RLS
```

instead of a Next.js request-time proxy.

If the project later moves to a server-capable deployment, a separate server-runtime profile can add Proxy and server-only secret-key operations.

## 15. RLS security model

Public corpus/research tables are read-only through the public client.

Private workspace tables are restricted by:

```sql
auth.uid() = user_id
```

Administrative data is protected by permissions such as:

```text
user.read
user.suspend
role.assign
audit.read
content.review
```

Role assignment, account lifecycle changes, and editorial review transitions use SECURITY DEFINER RPCs with explicit authorization checks.

## 16. Troubleshooting Supabase connection

If the app says Supabase is not configured:

```powershell
Get-Content .env.local
```

Verify both:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

Then restart Next.js:

```powershell
Ctrl+C
npm run dev
```

Environment changes require a new dev-server process.

If Auth works but roles show empty:

```powershell
supabase migration list
```

Then verify `0008` and `0009` are applied.

If an administrator cannot see users:

- confirm the account has `ADMIN` or `SUPER_ADMIN`
- confirm the corresponding role exists in `user_roles`
- sign out/in again
- check RLS and the `user.read` permission

If role assignment fails:

- confirm the caller has `role.assign`
- only `SUPER_ADMIN` can assign/revoke `SUPER_ADMIN`
- `READER` is the baseline authenticated role and cannot be revoked

## 17. Production rule

Never run:

```powershell
supabase db reset
```

against a production database.

Use versioned migrations:

```powershell
supabase migration new feature_name
supabase db push --dry-run
supabase db push
```
