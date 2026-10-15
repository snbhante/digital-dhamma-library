# Validation Report — v0.16.0

**Evidence policy:** Do not mark a check passed until the command exits with code 0 in the release environment. Remote Supabase checks must be recorded separately from local source checks.

## Automated checks

| Check | Command | Result | Evidence / notes |
|---|---|---|---|
| Architecture | `npm run validate:architecture` | **Passed** | Executed in this environment; exit code 0. |
| UI structure | `npm run validate:ui` | **Passed** | Includes v0.16.0 search modal/avatar assertions; exit code 0. |
| Workspace schema | `npm run validate:workspace` | **Passed** | Includes avatar migration/profile edit assertions; exit code 0. |
| Research index | `npm run build:research-index` | **Passed** | Generated indexes: 1 edition, 2 translations, 11 morphology records, 385 tokens, 94 sentences, 182 paragraph alignments, 22 cross-reference links, and other modeled resources. |
| Corpus data | `npm run validate:data` | **Passed** | 14 works, 91 paragraphs, 94 sentences, and research resources validated; exit code 0. |
| TypeScript | `npm run typecheck` | **Blocked** | `next: not found`; dependency installation could not finish because `registry.npmjs.org` DNS lookup returned `EAI_AGAIN`. Runtime here is Node 22.16.0/npm 10.9.2, below the repository-pinned Node 24.21/npm 12.1 requirement. |
| Dependency audit | `npm run security:audit` | **Blocked** | npm audit endpoint returned `EAI_AGAIN registry.npmjs.org`; no current audit result can be claimed. |
| Static production build | `npm run build` | **Blocked** | Pre-build, UI, workspace, index, and data checks passed; Next build could not start because dependencies were unavailable (`next: not found`). |
| Release gate | `npm run validate:release` | **Not completed** | Depends on typecheck/build/audit, which are blocked in this environment. Run after a successful `npm ci` on supported Node/npm. |
| Archive hygiene | inspect ZIP entries | **Passed** | 405 entries; confirmed no `.env.local`, `.git/`, `node_modules/`, `.next/`, `out/`, or `*.tsbuildinfo` entries. |

## Manual checks

- [ ] Home page has one Search button and query navigation works.
- [ ] Search Settings opens and closes by close button, backdrop, and Escape.
- [ ] All five search settings affect result filtering and URL state.
- [ ] Save Search modal saves a named query and reports errors.
- [ ] Account page shows an uploaded avatar or gender-aware fallback.
- [ ] Avatar upload rejects unsupported MIME types and files over 3 MB.
- [ ] Profile edit toggle, Cancel, and Save work as expected.
- [ ] Roles and permission keys are visible and accurate for a signed-in test account.
- [ ] Dashboard spacing is correct at 360, 480, 768, 1024, and 1440 px.
- [ ] Reader, workspace, citations, and existing routes still work.
- [ ] Non-admin account cannot call admin RPCs successfully.

## Remote Supabase checks

- [ ] `supabase migration list` shows migrations 0001–0011 applied as intended.
- [ ] Storage bucket `avatars` is public, with a 3 MB limit and expected MIME allowlist.
- [ ] A signed-in user can upload to their own `<auth.uid()>/` folder.
- [ ] A user cannot insert, update, or delete an object in another user's folder.
- [ ] Public avatar URLs load as expected; do not store private images in this bucket.
- [ ] Account/profile RLS and role/permission reads work for Reader and Admin test accounts.
- [ ] GitHub Pages Auth redirect URLs and the production frontend configuration are correct.

**Release decision: not fully validated yet.** Source-level architecture/UI/workspace/data checks passed, but TypeScript, dependency audit, and production build are blocked by dependency registry DNS failure and the execution environment using an unsupported Node/npm version. Do not describe this artifact as a fully production-validated release until those checks pass on Node 24.21.x/npm 12.1.x and the remote Supabase checks are completed.
