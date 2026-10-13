# Digital Dhamma Library v0.15.2 — SETUP & GUIDELINE (A–Z)

এই নথি `digital-dhamma-library`-এর local development, Supabase Auth/Database, GitHub Pages static deployment, user/profile management, validation এবং GitHub release-এর পূর্ণ নির্দেশিকা। এটি v0.15.1 থেকে v0.15.2-এ করা সংশোধনগুলোর নথিও।

> **গুরুত্বপূর্ণ সীমা:** এই source package থেকে live Supabase project বা GitHub Pages-এর runtime-এ প্রবেশ করা হয়নি। তাই local/static validation এবং live production smoke test আলাদা। নিচের live checks নিজের Supabase project ও deployed site-এ সম্পন্ন না করা পর্যন্ত production connection-কে verified বলা যাবে না।

## 1. v0.15.2-তে কী সংশোধন হয়েছে

1. **Profile schema consistency:** browser client যে `interface_language`, `public_profile`, `preferences` এবং `contributor_handle` fields পড়ে/লেখে, fresh database-এ সেগুলো না থাকলে profile query/save ব্যর্থ হতে পারে। নতুন migration `0010_auth_profile_backfill.sql` এই columns নিশ্চিত করে।
2. **Existing Auth users-এর profile backfill:** পুরোনো account-গুলো signup trigger যোগ হওয়ার আগেই তৈরি হয়ে থাকলে তাদের `profiles` row নাও থাকতে পারে। নতুন migration শুধু অনুপস্থিত profile তৈরি করে; আগে থেকে থাকা profile overwrite করে না।
3. **Reader role baseline:** migration বিদ্যমান account-গুলোর জন্য `READER` assignment যোগ করে, যদি `READER` role থাকে। কাউকে `ADMIN` বা `SUPER_ADMIN` করে না।
4. **Signup trigger পুনরায় নিশ্চিতকরণ:** ভবিষ্যতের Auth signup-এ profile এবং baseline `READER` assignment তৈরি হবে।
5. **Dummy Supabase endpoint বাদ:** `apps/web/utils/supabase/client.ts` আর `https://dummy.supabase.co` বা fake key দিয়ে নীরবে client তৈরি করে না। Configuration অনুপস্থিত থাকলে actionable error দেয়।
6. **GitHub Actions fail-fast:** Pages build-এর আগে Supabase URL ও publishable key-এর Actions Variables যাচাই হয়। ভুল/অনুপস্থিত configuration-এ deploy artifact বানিয়ে ভুলভাবে সফল দেখানোর বদলে workflow থামবে।
7. **Release hygiene:** package version `0.15.2`; release archive-এ `.env.local`, `.git`, `node_modules`, `.next`, এবং `out` রাখা হবে না।

## 2. Architecture ও নিরাপত্তা

- GitHub Pages কেবল static frontend host করে: `https://snbhante.github.io/digital-dhamma-library/`
- Supabase Auth, PostgreSQL, RLS এবং নিরাপদ admin RPC প্রদান করে।
- Browser bundle-এ কেবল `NEXT_PUBLIC_SUPABASE_URL` এবং `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` থাকতে পারে।
- `service_role`, Supabase secret key, database password বা personal access token কখনো frontend, GitHub Pages artifact, ZIP, repository, issue বা chat-এ দেবেন না।
- User/profile data-র authorization database-এর RLS ও RPC-তে enforce হতে হবে; শুধু UI-তে control লুকানো যথেষ্ট নয়।
- Static export-এ Next.js server route, Middleware/Proxy বা server-only runtime কাজ করবে না।

## 3. Prerequisites

প্রকল্পের `package.json` অনুযায়ী Node.js `>=24.21.0 <25` এবং npm `>=12.1.0` ব্যবহার করুন। Windows 11 PowerShell-এ যাচাই:

```powershell
node --version
npm --version
git --version
```

প্রয়োজনীয় সংস্করণ না হলে আগে Node.js/npm আপডেট করুন। অন্য major version-এ validation না চালিয়ে release readiness ঘোষণা করবেন না।

## 4. ZIP থেকে clean project প্রস্তুত

1. ZIP-টি extract করুন।
2. Extract করা `digital-dhamma-library` project root-এ PowerShell খুলুন।
3. নিশ্চিত করুন root-এ `package.json`, `package-lock.json`, `.env.example`, `apps`, `supabase`, `scripts` আছে।
4. ZIP-এ `.env.local` থাকলে সেটি ব্যবহার করবেন না; এই release archive-এ local environment file থাকার কথা নয়। নিজের machine-এ দরকার হলে `.env.example` থেকে নতুন `.env.local` তৈরি করুন।

```powershell
Copy-Item .env.example .env.local
```

`.env.local`-এ:

```dotenv
NEXT_PUBLIC_BASE_PATH=
NEXT_ALLOWED_DEV_ORIGINS=localhost,127.0.0.1
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

`YOUR_PROJECT_REF` এবং `YOUR_KEY`-এর জায়গায় নিজের Supabase project-এর তথ্য বসান। `.env.local` কখনো `git add` করবেন না। `.gitignore`-এ `.env.*` বাদ এবং `!.env.example` allow থাকা উচিত।

## 5. Supabase project ও Auth সেটআপ

1. https://supabase.com/dashboard খুলে সঠিক project নির্বাচন করুন।
2. Project URL এবং **publishable key** সংগ্রহ করুন। পুরোনো project-এ legacy `anon` key থাকলে সেটি public client key হিসেবে ব্যবহার করা যায়; `service_role`/secret key নয়।
3. **Authentication → Providers**-এ Email provider সক্রিয় করুন।
4. **Authentication → URL Configuration** খুলুন।
5. Site URL সেট করুন:

   `https://snbhante.github.io/digital-dhamma-library/`

6. Redirect URLs-এ নিচের ঠিকানাগুলো যোগ করুন:

   - `http://localhost:3000/**`
   - `https://snbhante.github.io/digital-dhamma-library/**`

7. Email confirmation চালু থাকলে email template-এর redirect আচরণ পরীক্ষা করুন। Production SMTP ও password-reset email flow আলাদাভাবে পরীক্ষা করুন।
8. OAuth ব্যবহার করলে provider credentials এবং callback URL আলাদাভাবে configure করতে হবে।

**সতর্কতা:** URL-এ repository base path `/digital-dhamma-library/` বাদ দিলে confirmation/reset link ভুল পৃষ্ঠায় যেতে পারে।

## 6. Migration প্রয়োগ

প্রথমে Supabase CLI install করে login করুন। তারপর project root-এ:

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list
supabase db push --dry-run
```

Dry-run output পড়ে নিশ্চিত করুন linked project সঠিক এবং migration তালিকা প্রত্যাশিত। তারপর:

```powershell
supabase db push
supabase migration list
```

`supabase/migrations`-এ migration `0001`–`0010` ক্রমানুসারে থাকবে। বিশেষ করে `0010_auth_profile_backfill.sql` প্রয়োগ হয়েছে কি না নিশ্চিত করুন। এটি idempotent backfill হিসেবে লেখা, কিন্তু production schema change-এর আগে backup নেওয়া উত্তম।

Production-এ `supabase db reset --linked` চালাবেন না। Migration history এবং actual schema না মিললে `migration repair` অনুমান করে চালাবেন না; আগে schema, migration history ও backup পর্যালোচনা করুন।

### Migration verification SQL

Supabase Dashboard → SQL Editor-এ চালান:

```sql
select
  to_regclass('public.profiles') as profiles_table,
  to_regclass('public.roles') as roles_table,
  to_regclass('public.user_roles') as user_roles_table,
  to_regclass('public.role_permissions') as role_permissions_table;
```

এরপর profile fields যাচাই:

```sql
select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'profiles'
order by ordinal_position;
```

`interface_language`, `public_profile`, `preferences`, `contributor_handle`, `account_status`, `suspension_reason`, `last_seen_at` উপস্থিত আছে কি না যাচাই করুন।

## 7. Existing Auth user ও profile যাচাই/পূরণ

Migration `0010` পুরোনো Auth users-এর missing profile row পূরণ করে। Migration প্রয়োগের পরে:

```sql
select
  u.id as auth_user_id,
  u.email,
  p.id as profile_id,
  p.display_name,
  p.account_status
from auth.users u
left join public.profiles p on p.id = u.id
order by u.created_at desc
limit 100;
```

প্রত্যেক account-এর ক্ষেত্রে `auth_user_id` এবং `profile_id` একই UUID হওয়া উচিত। `profile_id` NULL হলে migration সফলভাবে প্রয়োগ হয়েছে কি না এবং SQL error আছে কি না যাচাই করুন।

## 8. প্রথম SUPER_ADMIN bootstrap

Migration ও role seed সফল হওয়ার পর সাধারণ Auth UI দিয়ে নিজের account তৈরি/confirm করে sign in করুন। Supabase Dashboard → Authentication → Users থেকে নিজের account-এর UUID কপি করুন। SQL Editor-এ প্রথমে যাচাই করুন:

```sql
select u.id, u.email, r.id as role_id, r.name
from auth.users u
cross join public.roles r
where u.id = 'YOUR_USER_UUID'::uuid
  and r.name = 'SUPER_ADMIN';
```

একটি row এবং নিজের account সঠিকভাবে দেখা গেলেই grant করুন:

```sql
insert into public.user_roles (user_id, role_id, assigned_by)
select 'YOUR_USER_UUID'::uuid, r.id, 'YOUR_USER_UUID'::uuid
from public.roles r
where r.name = 'SUPER_ADMIN'
on conflict (user_id, role_id) do nothing;
```

`YOUR_USER_UUID` দুই জায়গায় নিজের প্রকৃত UUID দিয়ে প্রতিস্থাপন করুন। তারপর:

```sql
select u.email, r.name, ur.assigned_at, ur.assigned_by
from public.user_roles ur
join public.roles r on r.id = ur.role_id
join auth.users u on u.id = ur.user_id
where u.id = 'YOUR_USER_UUID'::uuid;
```

Sign out/in করুন। এই bootstrap শুধুমাত্র বিশ্বস্ত Supabase SQL Editor-এ করবেন; browser console বা public frontend-এ নয়।

## 9. Dependencies install ও local development

Project root-এ:

```powershell
npm ci
npm run dev
```

তারপর `http://localhost:3000` খুলুন। `.env.local` সম্পাদনা করলে dev server বন্ধ করে আবার চালু করুন, কারণ environment values startup/build সময়ে পড়া হয়।

Supabase configuration ছাড়া public/local-first reading চলতে পারে; Auth/profile/cloud operations চালাতে সঠিক URL ও key প্রয়োজন। ভুল configuration থাকলে fake endpoint-এ নীরব request হবে না—স্পষ্ট configuration error দেখাবে।

## 10. Automated validation

এক এক করে project root থেকে চালান:

```powershell
npm run validate:architecture
npm run validate:ui
npm run validate:workspace
npm run build:research-index
npm run validate:data
npm run typecheck
npm audit --audit-level=high
npm run build
npm run validate:release
```

প্রতিটি command-এর exit code `0` না হলে পরবর্তী release ধাপে যাবেন না। `npm audit`-এ vulnerability থাকলে package-specific advisory review করে dependency update করুন; audit bypass করে clean release দাবি করবেন না।

`npm run build` সফল হলে deployable static output `apps/web/out`-এ তৈরি হবে। ZIP-এ `.env.local`, `.git`, `node_modules`, `.next` বা `apps/web/out` অন্তর্ভুক্ত করবেন না।

## 11. Local functional acceptance tests

1. `/auth/`-এ নতুন test account sign up করুন।
2. Email confirmation চালু থাকলে confirmation link ব্যবহার করুন।
3. Sign in/out একাধিকবার পরীক্ষা করুন।
4. `/account/`-এ profile load করুন, display name/bio/interface language বদলে Save করুন।
5. পৃষ্ঠা refresh করে saved values database থেকে ফেরত আসছে কি না যাচাই করুন।
6. Supabase Table Editor-এ `profiles.id` = `auth.users.id` নিশ্চিত করুন।
7. `user_roles`-এ সাধারণ user-এর `READER` role আছে কি না যাচাই করুন।
8. `/dashboard/`, `/workspace/`, `/admin/`, `/admin/users/` পরীক্ষা করুন।
9. সাধারণ Reader account দিয়ে admin role assignment/status mutation চেষ্টা করলে database/RPC-তে প্রত্যাখ্যাত হতে হবে।
10. Browser DevTools → Network/Console-এ `401`, `403`, `404`, `400`, CORS, schema cache বা redirect error দেখুন। Response body-তে sensitive token থাকলে তা শেয়ার করবেন না।

## 12. GitHub repository ও Pages configuration

1. https://github.com/snbhante/digital-dhamma-library খুলুন।
2. **Settings → Secrets and variables → Actions → Variables**-এ এই দুটি Repository Variable তৈরি করুন:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
3. এগুলো public browser config; এখানে কখনো service-role/secret key দেবেন না।
4. **Settings → Pages → Build and deployment**-এ Source হিসেবে **GitHub Actions** নির্বাচন করুন।
5. `.github/workflows/pages.yml` workflow `apps/web/out` deploy করে কি না নিশ্চিত করুন।
6. `main`-এ push করার পরে Actions tab-এ build ও deploy job green হওয়া পর্যন্ত অপেক্ষা করুন।
7. Live site খুলুন: `https://snbhante.github.io/digital-dhamma-library/`
8. Hard refresh করে DevTools → Network/Console পরীক্ষা করুন।

Workflow Supabase Variables না পেলে build stage-এ fail-fast করবে। Variable যোগ করার পর workflow re-run করুন।

## 13. GitHub Pages live Supabase smoke test

শুধু build green হওয়া মানে database connection সফল নয়। Live site-এ:

- Auth sign up/sign in এবং confirmation redirect;
- Account/profile load এবং Save;
- sign out/in-এর পরে session persistence;
- user role/permission load;
- admin user list, role assign/revoke, account status change;
- non-admin account দিয়ে privileged RPC rejection;
- mobile layout এবং base-path assets

পরীক্ষা করুন। Failed request-এর status, Supabase error code/message এবং request URL-এর sensitive অংশ বাদ দিয়ে diagnostic note রাখুন। Publishable key public হওয়ার জন্য secret নয়, তবে session access/refresh token কখনো প্রকাশ করবেন না।

## 14. Troubleshooting matrix

| লক্ষণ | সম্ভাব্য কারণ | করণীয় |
|---|---|---|
| `Invalid API key` / Supabase request ব্যর্থ | ভুল project URL/key বা Actions Variables অনুপস্থিত | URL ও publishable/anon key যাচাই; service-role key ব্যবহার নয় |
| `Could not load profile` / missing column | migration `0010` প্রয়োগ হয়নি বা schema cache পুরোনো | `supabase migration list`, profile columns, migration output যাচাই |
| Auth user আছে কিন্তু profile নেই | account পুরোনো, trigger/backfill অনুপস্থিত/ব্যর্থ | migration `0010` চালিয়ে auth/profile ID join পরীক্ষা |
| Save-এ RLS error | own-row policy, grants বা ID mismatch | `profiles.id = auth.uid()` এবং INSERT/UPDATE policy যাচাই |
| UI-তে roles/permissions শূন্য | role seed/assignment বা read policy সমস্যা | `roles`, `user_roles`, `role_permissions`, `permissions` পরীক্ষা |
| Admin user list empty | profiles row অনুপস্থিত অথবা permission/RLS deny | backfill, `user.read` permission, RLS এবং Network error পরীক্ষা |
| Confirmation link ভুল URL-এ যায় | Supabase Site URL/redirect allow-list ভুল | GitHub Pages repository base path-সহ URL যোগ |
| Pages-এ asset 404 | `basePath`/artifact path mismatch | build env-এ `/digital-dhamma-library`, artifact `apps/web/out` |
| Supabase client configuration error | `.env.local` বা Actions Variables নেই/ভুল | নাম/মান ঠিক করে dev server restart বা workflow rerun |
| `npm ci` fail | Node/npm version mismatch, cache/network/EPERM | Node/npm pinned version, `npm cache verify`, clean install |

## 15. Git status, commit, push, tag ও release

প্রথমে project root-এ:

```powershell
git status --short
git remote -v
git fetch origin
git status -sb
git diff --check
git diff --stat
```

Remote-এ নতুন commit থাকলে আগে merge/rebase করে reconcile করুন। অজানা পরিবর্তন overwrite করতে force-push করবেন না।

Validation সম্পন্ন হলে:

```powershell
git add -A
git diff --cached --check
git commit -m "fix: harden Supabase profile and Pages configuration"
git push origin main
```

PowerShell-এ `SETUP&GUIDLINE.md` path-এর `&` parsing সমস্যা এড়াতে `git add -A` ব্যবহার করা সহজ হতে পারে, তবে `git status` দেখে নিশ্চিত করুন `.env.local` stage হয়নি।

Release validation সফল হলে:

```powershell
git tag -a v0.15.2 -m "Digital Dhamma Library v0.15.2"
git push origin v0.15.2
```

GitHub → Releases → Draft a new release → tag `v0.15.2` নির্বাচন করুন, release notes যুক্ত করুন, sanitized source ZIP attach করুন এবং প্রকাশ করুন। একই tag আগে থেকেই থাকলে যাচাই না করে overwrite করবেন না। ZIP-এর SHA-256 তৈরি করতে:

```powershell
Get-FileHash .\digital-dhamma-library_v0.15.2.zip -Algorithm SHA256
```

## 16. Release security checklist

- [ ] `.env.local` Git-tracked নয় এবং ZIP-এ নেই।
- [ ] `service_role`, secret key, database password বা access token frontend/source/release-এ নেই।
- [ ] `node_modules`, `.git`, `.next`, `out` release ZIP-এ নেই।
- [ ] Migration `0010` remote project-এ প্রয়োগ হয়েছে।
- [ ] Profile ID এবং Auth user ID মেলে।
- [ ] Supabase RLS ও privileged RPC-গুলো সাধারণ user-এর জন্য সুরক্ষিত।
- [ ] Automated validation-এর প্রকৃত output সংরক্ষিত।
- [ ] GitHub Actions build ও Pages deploy সফল।
- [ ] Live Pages Auth ও profile save smoke test সম্পন্ন।
- [ ] Release ZIP SHA-256 নথিবদ্ধ।

## 17. Validation evidence ও সীমাবদ্ধতা

এই package review-তে source-level issues সংশোধন করা হয়েছে, তবে remote Supabase project-এর credentials, migration state, RLS policies, GitHub Actions Variables এবং live browser runtime এই execution environment থেকে নিশ্চিত করা যায়নি। আপনার মেশিনে Node/npm-এর প্রয়োজনীয় version দিয়ে উপরের automated commands এবং live smoke tests চালিয়ে ফলাফল রেকর্ড করুন। Command চালানো না হলে তাকে “passed” হিসেবে নথিবদ্ধ করবেন না।
