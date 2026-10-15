# Digital Dhamma Library v0.16.0 — SETUP & GUIDELINE

এই নথিতে v0.16.0-এর project setup, local development, Supabase configuration, avatar storage migration, validation, GitHub Pages deployment, GitHub push/release এবং troubleshooting ধাপে ধাপে দেওয়া হয়েছে। GitHub Pages-এ Next.js static export চালানো হয়; তাই request-time Next.js Middleware/Proxy বা server-only route handler সেখানে চলবে—এমন ধরে নেওয়া যাবে না।

## 1. v0.16.0-তে কী এসেছে

- Home page-এ একটিমাত্র Search submit action; advanced search আলাদা page-এ থাকে।
- Search page-এর Field, Collection, Type, Language ও Limit controls এখন Search Settings modal-এর ভেতরে।
- Save this search modal-এ নাম দিয়ে সংরক্ষণ করা যায়। বর্তমান implementation browser-local workspace-এ সংরক্ষণ করে; cloud sync আছে ধরে নেবেন না।
- Account section-এ avatar, display name, email ও role দেখানো হয়; Permissions তালিকা Show/Hide button দিয়ে খোলা যায়। Profile bio read-only view-তে high-contrast highlight-এ দেখানো হয়।
- Profile section default-এ read-only; Edit profile toggle দিয়ে পরিবর্তন করা যায়।
- Avatar upload: JPEG, PNG, WebP, GIF; source image সর্বোচ্চ 10 MB। Browser-এ ছবিটি সর্বোচ্চ 512×512 px-এ resize করে WebP (quality 0.82) হিসেবে compress করা হয়; compressed image 500 KB-এর বেশি হলে upload বাতিল হয়। Supabase Storage-এ compressed WebP রাখা হয় এবং profiles/Auth metadata-তে URL রাখা হয়—binary image সরাসরি PostgreSQL row-তে রাখা হয় না। Gender preference `profiles.preferences.gender`-এ রাখা হয় এবং ছবি না থাকলে fallback avatar দেখানো হয়।
- Global account link display name-এর পরিবর্তে avatar-এ রাখা হয়েছে। Dashboard identity-তেও avatar link আছে।
- Dashboard stat cards ও Identity/Roles & Access cards-এর মধ্যে vertical spacing বাড়ানো হয়েছে।
- নতুন Supabase migration: `20261015093600_profile_avatar_storage.sql`।
- নতুন phased roadmap ও validation checklist: `docs/roadmap/ROADMAP-PHASED-V0.16.0.md` এবং `docs/validation/VALIDATION-REPORT-V0.16.0.md`।

## 2. Prerequisites

প্রকল্পের pinned runtime range অনুসরণ করুন:

- Node.js `>=24.21.0 <25`
- npm `>=12.1.0`
- Git
- Supabase CLI (শুধু database migration ও remote verification-এর জন্য)

PowerShell-এ যাচাই করুন:

```powershell
node --version
npm --version
git --version
```

Version range না মিললে আগে runtime ঠিক করুন; validation bypass করবেন না।

## 3. Source সংগ্রহ ও local environment

### GitHub থেকে clone

```powershell
git clone https://github.com/snbhante/digital-dhamma-library.git
cd digital-dhamma-library
Copy-Item .env.example .env.local
```

যদি GitHub repository-তে v0.16.0 এখনও push না হয়ে থাকে, তাহলে এই release ZIP extract করে project directory-তে প্রবেশ করুন। ZIP-এর ভেতরে `.git`, `node_modules`, `.next`, `apps/web/out`, `.env.local` থাকা উচিত নয়।

### `.env.local` সম্পাদনা

```dotenv
NEXT_PUBLIC_BASE_PATH=
NEXT_ALLOWED_DEV_ORIGINS=localhost,127.0.0.1
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YOUR_KEY
```

- `NEXT_PUBLIC_SUPABASE_URL`: আপনার Supabase Project URL।
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: Supabase publishable key (`sb_publishable_...`)।
- `NEXT_PUBLIC_BASE_PATH`: local development-এ খালি রাখুন। GitHub Pages build-এ `/digital-dhamma-library` হবে।
- `NEXT_ALLOWED_DEV_ORIGINS`: local dev-এর জন্য প্রয়োজনীয় origin-গুলো comma-separated লিখুন। wildcard ব্যবহার করবেন না যদি তার কারণ/প্রভাব না জানেন।

**নিরাপত্তা:** `sb_secret_...`, legacy `service_role`, database password বা অন্য কোনো privileged secret `NEXT_PUBLIC_*` variable-এ, frontend source-এ, GitHub Pages artifact-এ, issue-তে বা release ZIP-এ রাখবেন না। `.env.local` কখনো commit করবেন না।

## 4. Dependencies install ও local run

```powershell
npm ci
npm run dev
```

Browser-এ `http://localhost:3000` খুলুন। Environment variable পরিবর্তন করলে dev server restart করুন।

Supabase configure না থাকলেও public corpus-এর static reading/search অংশ local-first mode-এ ব্যবহারযোগ্য হওয়ার কথা; Account/Cloud Auth সুবিধা চালাতে সঠিক Supabase URL ও publishable key দরকার।

## 5. Supabase project setup

1. Supabase Dashboard-এ সঠিক project খুলুন বা তৈরি করুন।
2. Project URL ও publishable key সংগ্রহ করুন।
3. Authentication → URL Configuration-এ Site URL দিন:
   `https://snbhante.github.io/digital-dhamma-library/`
4. Redirect URLs-এ অন্তর্ভুক্ত করুন:
   - `http://localhost:3000/**`
   - `https://snbhante.github.io/digital-dhamma-library/**`
5. Authentication → Providers-এ Email/password চালু আছে কি না যাচাই করুন। Email confirmation চালু থাকলে SMTP/confirmation settings পরীক্ষা করুন।
6. `.env.local`-এ সঠিক URL/key বসিয়ে dev server restart করুন।

## 6. Database migration নিরাপদে প্রয়োগ

প্রথমে নিশ্চিত করুন যে CLI সঠিক Supabase project-এ link করা হয়েছে। Production database-এ destructive reset চালাবেন না।

```powershell
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase migration list
supabase db push --dry-run
```

Dry-run output পড়ে migration তালিকা ও linked project যাচাই করুন। তারপর:

```powershell
supabase db push
supabase migration list
```

v0.16.0-তে migration chain-এর শেষ migration হলো `20261015093600_profile_avatar_storage.sql`। `supabase/migrations/`-এ থাকা migration filenames ও remote migration history মিলিয়ে দেখুন। যদি migration history বলে migration applied কিন্তু table/policy অনুপস্থিত হয়, তাহলে থেমে schema/history reconcile করুন; অন্ধভাবে migration SQL পুনরায় চালাবেন না। Production-এ `supabase db reset --linked` চালাবেন না। Schema পরিবর্তনের আগে backup/restore plan নিশ্চিত করুন।

## 7. Avatar Storage migration ও security

`20261015093600_profile_avatar_storage.sql` নিচের কাজ করে:

- `avatars` নামে public Supabase Storage bucket তৈরি/configure করে।
- Maximum object size 3 MB এবং MIME allowlist: JPEG, PNG, WebP, GIF।
- Public read অনুমোদন করে, কারণ avatar public profile imagery হিসেবে ব্যবহৃত হয়।
- Authenticated user কেবল নিজের Auth UUID-র folder (`<user-uuid>/...`)-এ upload/update/delete করতে পারে।

### গুরুত্বপূর্ণ গোপনীয়তা

এই bucket-এর ছবিগুলো public URL-এ দেখা যায়। ব্যক্তিগত, সংবেদনশীল বা পরিচয়-প্রমাণকারী ছবি আপলোড করবেন না। Private image দরকার হলে public bucket ব্যবহার না করে private bucket, signed URL এবং আলাদা policy design করতে হবে।

Migration apply করার পরে Supabase Dashboard → Storage-এ `avatars` bucket দেখুন। তারপর দুইটি test account দিয়ে যাচাই করুন:

1. Account A নিজের avatar upload করতে পারে।
2. Account A, Account B-এর folder-এ write/update/delete করতে পারে না।
3. Public avatar URL load হয়।
4. Unsupported file type এবং 3 MB-এর বড় ফাইল UI থেকে reject হয়।

## 8. First administrator bootstrap

সাধারণ Auth UI দিয়ে account তৈরি করুন এবং email confirmation সম্পন্ন করুন। Supabase Dashboard → Authentication → Users থেকে সেই account-এর UUID কপি করুন। তারপর trusted project administrator হিসেবে SQL Editor-এ কেবল সেই UUID ব্যবহার করে `SUPER_ADMIN` assign করুন। Email string-এর ভিত্তিতে role grant করবেন না।

```sql
insert into public.user_roles (user_id, role_id, assigned_by)
select 'YOUR_USER_UUID'::uuid, r.id, 'YOUR_USER_UUID'::uuid
from public.roles r
where r.name = 'SUPER_ADMIN'
on conflict do nothing;
```

`YOUR_USER_UUID`-এর জায়গায় প্রকৃত UUID বসান। এরপর:

```sql
select u.id as user_id, u.email, r.name as role_name
from public.user_roles ur
join public.roles r on r.id = ur.role_id
join auth.users u on u.id = ur.user_id
where u.id = 'YOUR_USER_UUID'::uuid
order by r.name;
```

Sign out করে আবার sign in করুন। Dashboard ও `/admin/` routes যাচাই করুন। UI-তে button লুকানো authorization নয়; প্রকৃত security boundary হলো RLS এবং privileged RPC authorization।

## 9. Profile, gender preference ও avatar ব্যবহারের নিয়ম

- Profile section default-এ read-only থাকে। Edit profile চাপলে editable fields দেখা যায়।
- Display name, bio, interface language, gender preference এবং public-profile option পরিবর্তন করে Save profile চাপুন।
- Avatar upload profile editor-এর ভেতর থেকে করা হয়। Upload-এর পরে ছবির URL `profiles.avatar_url`-এ সংরক্ষণ করা হয়।
- Gender preference বিদ্যমান `profiles.preferences` JSONB field-এর `gender` key-তে রাখা হয়; নতুন `profiles.gender` column লাগে না।
- Avatar না থাকলে `female`, `male` বা neutral preference অনুযায়ী fallback avatar দেখায়। Gender preference optional এবং ব্যবহারকারী নিজেই সেট করেন।
- Account page-এ Roles এবং Permissions আলাদাভাবে দেখানো হয়। Role assignment ভুল হলে Supabase migration, `user_roles`, `role_permissions`, RLS এবং Auth session পুনরায় পরীক্ষা করুন।

## 10. Required validation

Repository root থেকে এই ক্রমে চালান:

```powershell
npm run validate:architecture
npm run validate:ui
npm run validate:workspace
npm run build:research-index
npm run validate:data
npm run typecheck
npm run security:audit
npm run build
npm run validate:release
```

প্রতিটি command-এর exit code 0 হতে হবে। `validate:release` কিছু checks পুনরায় চালায়—এটি ইচ্ছাকৃত। Validation report আপডেট করুন:

`docs/validation/VALIDATION-REPORT-V0.16.0.md`

শুধু কমান্ড চালানো হয়েছে বলে “passed” লিখবেন না; প্রকৃত exit code ও error/notes রেকর্ড করুন। Supabase remote behavior local build দ্বারা প্রমাণিত হয় না।

## 11. Manual acceptance checklist

- [ ] Home page-এ একটিমাত্র Search submit button আছে।
- [ ] Search submit query-সহ `/search/`-এ নিয়ে যায়।
- [ ] Search Settings modal button, close button, backdrop ও Escape দিয়ে বন্ধ হয়।
- [ ] Field, Collection, Type, Language ও Limit result set-এ প্রভাব ফেলে।
- [ ] Save this search modal নাম ছাড়া save করে না; সফল/ব্যর্থ অবস্থা দেখায়।
- [ ] Account-এ avatar বা gender-aware fallback দেখা যায়।
- [ ] Profile read-only ও edit mode toggle কাজ করে।
- [ ] Avatar upload সফল এবং invalid/oversized file reject হয়।
- [ ] Roles ও permission keys আলাদা, স্পষ্টভাবে দেখা যায়।
- [ ] Dashboard stats ও identity/access cards-এর মধ্যে পর্যাপ্ত gap আছে।
- [ ] Public Reader account দিয়ে Admin RPC unauthorized থাকে।
- [ ] Reader, dictionary, workspace, citations, search, research ও editorial routes পরীক্ষা করা হয়েছে।
- [ ] Keyboard navigation, focus indicator ও mobile layout পরীক্ষা করা হয়েছে।

Responsive widths: 360, 480, 768, 1024, 1440 px।

## 12. GitHub Pages deployment

1. GitHub repository → Settings → Secrets and variables → Actions → Variables-এ এই variables যোগ করুন:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
2. Settings → Pages → Build and deployment-এ **GitHub Actions** নির্বাচন করুন।
3. `.github/workflows/pages.yml` workflow-তে base path `/digital-dhamma-library` সেট হয় কি না যাচাই করুন।
4. Workflow-তে static build artifact `apps/web/out` deploy হচ্ছে কি না যাচাই করুন।
5. Push-এর পরে Actions-এ build/deploy job green না হওয়া পর্যন্ত release complete ধরে নেবেন না।
6. Live URL খুলুন: `https://snbhante.github.io/digital-dhamma-library/`
7. Browser DevTools → Console ও Network-এ 404, missing asset, Auth redirect, CORS এবং Supabase API error পরীক্ষা করুন।
8. Email confirmation/password reset flow পরীক্ষা করুন।

GitHub Pages static host; Next.js request-time Middleware/Proxy এবং server-only route handlers সেখানে চালানোর পরিকল্পনা করবেন না। Future AI API-এর জন্য server-side/Edge Function architecture লাগবে; provider secret frontend-এ রাখা যাবে না।

## 13. GitHub push — নতুন বা বিদ্যমান repository

প্রথমে:

```powershell
git status --short
git remote -v
git branch --show-current
git diff --check
```

যদি repository আগে থেকেই clone করা থাকে, আগে remote changes আনুন:

```powershell
git fetch origin
git status -sb
git pull --rebase origin main
```

`git pull --rebase` conflict দিলে conflict সমাধান করে tests পুনরায় চালান। Remote commit অজানা থাকলে force push করবেন না। এরপর validation pass হলে:

```powershell
git add -A
git diff --cached --check
git diff --cached --stat
git commit -m "Release v0.16.0: research UX and profile improvements"
git push origin main
```

`.env.local`, database password, Supabase secret/service-role key, `.git/`, `node_modules/`, `.next/`, `apps/web/out/` commit করবেন না। `git status --short` দিয়ে staged/untracked file যাচাই করুন।

## 14. Sanitized release ZIP তৈরি

ZIP-এ source code, data, migration, scripts ও documentation থাকবে; local credentials, Git metadata, installed dependencies ও build output থাকবে না। Windows PowerShell থেকে project root-এর parent directory-তে চালান:

```powershell
$root = (Resolve-Path .).Path
$release = Join-Path (Split-Path $root -Parent) 'digital-dhamma-library-v0.16.0'
$zip = Join-Path (Split-Path $root -Parent) 'digital-dhamma-library_v0.16.0.zip'
if (Test-Path $release) { Remove-Item $release -Recurse -Force }
New-Item -ItemType Directory -Path $release | Out-Null
robocopy $root $release /E /XD .git node_modules .next out /XF .env.local .env.development.local .env.production.local
if ($LASTEXITCODE -ge 8) { throw "robocopy failed with exit code $LASTEXITCODE" }
Get-ChildItem $release -Force -Recurse | Where-Object { $_.Name -eq '.env.local' -or $_.Name -eq '.git' -or $_.Name -eq 'node_modules' -or $_.Name -eq '.next' }
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path (Join-Path $release '*') -DestinationPath $zip -CompressionLevel Optimal
Get-FileHash $zip -Algorithm SHA256
```

`package-lock.json.backup` থাকলে release-এ অপ্রয়োজনীয় backup হিসেবে না রাখাই ভালো। ZIP তৈরি করার পরে archive list পরীক্ষা করে `.env.local`, `.git`, `node_modules`, `.next`, `apps/web/out` না থাকার বিষয়টি নিশ্চিত করুন।

## 15. Version tag ও GitHub Release

Tag তৈরি করার আগে নিশ্চিত করুন `main`-এ v0.16.0-এর validated commit আছে এবং একই tag আগে থেকে নেই:

```powershell
git tag --list v0.16.0
```

Tag না থাকলে:

```powershell
git tag -a v0.16.0 -m "Digital Dhamma Library v0.16.0"
git push origin v0.16.0
```

GitHub → Releases → Draft a new release → tag `v0.16.0` নির্বাচন করুন। `docs/RELEASE-NOTES-V0.16.0.md` থেকে release notes দিন, sanitized ZIP attach করুন এবং SHA-256 checksum যুক্ত করুন। একই tag ইতিমধ্যে থাকলে যাচাই না করে overwrite বা delete করবেন না।

## 16. Troubleshooting

| সমস্যা | সম্ভাব্য কারণ | করণীয় |
|---|---|---|
| `Could not load profile` | Migration/column mismatch, stale schema cache, RLS | বিস্তারিত Supabase error পড়ুন; migrations 0001–0011 ও profile RLS যাচাই করুন। |
| Avatar upload permission error | Migration 0011 অনুপস্থিত, bucket/policies ভুল, session নেই | Migration history, bucket এবং Storage policies যাচাই করুন। |
| Avatar upload unsupported type | File MIME allowlist-এর বাইরে | JPEG/PNG/WebP/GIF ব্যবহার করুন; সর্বোচ্চ 3 MB। |
| Avatar URL load হয় না | Bucket private, URL ভুল, object upload হয়নি | Storage object ও public URL যাচাই করুন; private bucket-এ public URL প্রত্যাশা করবেন না। |
| Role/permissions empty | Role assignment, seed data, RLS বা migrations | `user_roles`, `roles`, `role_permissions` এবং signed-in UUID যাচাই করুন। |
| GitHub Pages assets 404 | Base path বা artifact path mismatch | `/digital-dhamma-library` এবং `apps/web/out` workflow configuration যাচাই করুন। |
| `Middleware cannot be used with output: export` | Static profile-এ unsupported request-time middleware | Middleware/server-only file সরিয়ে browser-safe static architecture ব্যবহার করুন; Proxy-তে রূপান্তর করবেন না। |
| `npm ci` integrity/timeout/EPERM | Network/cache/file lock | Node process বন্ধ করে registry/cache যাচাই করুন; integrity check bypass করবেন না। |
| Build pass, কিন্তু live Auth fail | URL/key/redirect/CORS/remote schema mismatch | Actions variables, Supabase URL configuration, migration state ও browser Network যাচাই করুন। |

## 17. Related documentation

- `docs/roadmap/ROADMAP-PHASED-V0.16.0.md` — phase-by-phase roadmap ও acceptance gates।
- `docs/RELEASE-NOTES-V0.16.0.md` — user-facing release notes ও migration boundary।
- `docs/validation/VALIDATION-REPORT-V0.16.0.md` — automated, manual ও remote Supabase validation evidence।
- `SECURITY.md` — security reporting and boundaries।

## 18. Release readiness rule

Release কেবল তখনই publish করুন যখন automated commands pass, manual checklist সম্পন্ন, remote Supabase migration/Storage/RLS checks প্রমাণিত, release ZIP sanitized, GitHub Pages workflow green, এবং validation report-এ প্রকৃত evidence লেখা হয়েছে। Source archive একা live Supabase integration-এর প্রমাণ নয়।


## v0.16.0 follow-up changes and account deletion

- `Search settings` is an icon-only accessible button with a descriptive label/title.
- Permissions are presented with a permission key and human-readable description.
- Profile gender label is simply `Gender`; profile remains read-only until `Edit profile` is enabled.
- Avatar upload updates the profile row and Auth user metadata so avatar links in account/status/dashboard surfaces refresh.
- Occurrence reference cards use a responsive flex layout with explicit spacing between paragraph ID and Open action.
- Decorative sun/moon/star/edit glyphs are replaced with inline SVG icons.

### Account deletion: required deployment step

The account deletion button calls the Supabase Edge Function `delete-account`. It is deliberately fail-closed: the button will report a useful error unless the function is deployed and configured. Before deploying, review and set `ALLOWED_ORIGIN` to the exact GitHub Pages origin (for example `https://snbhante.github.io`) and configure the standard Supabase function secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` in the Edge Function environment. The service-role key must never be placed in frontend environment variables, Git, Pages variables, or client code. Deploy with the Supabase CLI after linking the intended project. Test using a disposable account first. Account deletion is permanent and can affect workspace rows through foreign-key policies; review retention, cascading deletion, audit obligations, and backups before production rollout.

### Access-controlled routes

The UI displays administrative links based on effective permissions; the route and every database/RPC operation must also enforce authorization. `/admin/users/` is the canonical user-management route in this release. Do not create a public `/users/` alias unless it uses the same permission checks and backend policies. SUPER_ADMIN status must never be inferred from a display name or email.

### Release validation

After these changes, run `npm run validate:release` with the Node/npm versions declared in `package.json`. Confirm the Edge Function separately with a test account and verify that avatar updates propagate in Account, Dashboard, and the global account avatar. Do not publish until typecheck, static build, audit, and manual authorization checks pass.


## v0.16.0 follow-up UI refinement

- Permissions list default-এ collapsed থাকে; Show permissions / Hide permissions button দিয়ে টগল হয়।
- Read-only Profile view-তে Bio-র জন্য উজ্জ্বল, উচ্চ-কনট্রাস্ট highlight রয়েছে; dark theme-এর জন্যও আলাদা রং নির্ধারিত।
- Avatar upload-এর আগে browser-side resize/compression: longest edge 512 px, WebP quality 0.82, compressed output maximum 500 KB। Supabase Storage-এ `image/webp` হিসেবে upload হয়; database/Auth metadata-তে URL রাখা হয়।
- পুরোনো cached avatar বদলাতে URL-এ version query parameter যোগ করা হয় এবং Auth user metadata synchronize করা হয়।
- Validation-এর সময় upload-এর পরে Auth metadata refresh, Account/Dashboard/Auth status-এর avatar consistency এবং WebP output যাচাই করুন।
