# Digital Dhamma Library — Phased Roadmap (v0.16.0)

**Status:** Proposed implementation roadmap anchored to the v0.15.2 source baseline and v0.16.0 changes. A phase is not considered complete merely because it appears in this document; completion requires implementation, automated checks, manual acceptance, and recorded evidence.

## Product principles

1. Preserve a static-export-compatible public frontend on GitHub Pages.
2. Keep the canonical corpus and search index version-controlled and source-aware.
3. Keep user identity, private workspace data, roles, and permissions in Supabase with RLS.
4. Keep secrets and privileged database keys out of browser code and release archives.
5. Distinguish canonical text, editorial interpretation, modern research, and AI-generated suggestions.
6. Make accessibility, responsive layout, source provenance, licensing, and release evidence part of the definition of done.

## Phase 0 — Reliability and UI baseline (v0.16.0)

### Included in this update
- Remove the duplicate home-page “Advanced Search” action: the home page now has one Search action; the dedicated Search page remains the place for advanced controls.
- Move Field, Collection, Type, Language, and Limit into an accessible Search Settings modal.
- Move Save this search into a naming modal and retain the existing local-workspace persistence contract.
- Add profile picture upload to the `avatars` Supabase Storage bucket with file type/size validation and per-user folder policies.
- Add gender preference to the existing profile `preferences` JSONB field; no extra profile column is required.
- Add gender-aware fallback avatars when no uploaded image is available.
- Make profile fields read-only by default and editable through an explicit toggle.
- Present roles and effective permissions as separate, legible sections.
- Replace the account-name link in the global auth indicator with an avatar link to Account.
- Add avatar-led identity presentation to the Dashboard and increase spacing between the stats and identity/access cards.
- Add migration `20261015093600_profile_avatar_storage.sql` and architecture validation assertions for the new release baseline.

### Acceptance criteria
- Home page exposes one search submit button, and it navigates to `/search/` with the query.
- Search Settings opens/closes with the button, close button, backdrop, and Escape; selected filters affect results and URL state.
- Save Search requires a non-empty name and reports success/failure accessibly.
- Avatar upload accepts image/jpeg, image/png, image/webp, and image/gif up to 3 MB; it rejects other files and oversized files.
- Storage policies restrict writes to the authenticated user's UUID folder. Public read is intentional because avatars are public profile imagery.
- Profile remains non-editable until Edit profile is enabled; Cancel editing hides the form without saving.
- Roles and permissions are not represented as interchangeable counts alone; actual role names and permission keys are visible.
- Dashboard stats have a visible vertical gap before the card grid at desktop and mobile widths.
- `npm run validate:architecture`, `npm run validate:ui`, `npm run validate:workspace`, `npm run validate:data`, `npm run typecheck`, `npm run build`, and `npm run validate:release` must pass locally before release.
- Remote Supabase behavior must be tested in the target project; local static build cannot prove remote RLS, Storage policies, Auth redirect, or migrations.

## Phase 1 — Citation and Reader 2.0 (v0.17.x)

- Stable work/paragraph citation identifiers and a documented citation schema.
- Parallel Pāḷi, English, and Bengali reading with reliable alignment metadata.
- Cross-reference links between canonical works, commentary, subcommentary, and dictionary records.
- Copy citation in human-readable and machine-readable formats.
- Reading settings, focus mode, and keyboard-accessible paragraph navigation.
- Automated broken-record, duplicate-ID, and unresolved-reference reports.

**Exit gate:** citations resolve to the same record after refresh; alignment quality is reviewable; no source relationship is silently invented.

## Phase 2 — Advanced Search 2.0 (v0.18.x)

- Search schema versioning and reproducible index builds.
- Exact-phrase and term matching with normalized Unicode/diacritics.
- Search filters for collection, text type, language, and edition where metadata exists.
- Result snippets and context windows; stable result links.
- Saved searches with explicit local-only/cloud-sync state and export/import.
- Performance tests on the full published corpus.

**Exit gate:** deterministic index build, documented ranking behavior, filter correctness tests, and no stale index after corpus changes.

## Phase 3 — Personal Research Workspace (v0.19.x)

- Research collections, notes/annotations anchored to stable paragraph IDs, bookmarks, and reading history.
- Research projects with questions, source lists, and progress notes.
- Export/import of workspace records; clear conflict handling when cloud sync is enabled.
- Private-by-default notes and RLS tests for cross-user isolation.

**Exit gate:** one user cannot read or alter another user's private workspace records; export/restore round-trip tests pass.

## Phase 4 — Editorial and Contribution Workflow (v0.20.x)

- Submission, review, request-changes, approval, and publication states.
- Immutable revision history and source/license/provenance requirements.
- Role/permission matrix tests for contributor, translator, researcher, editor, moderator, and administrator.
- Public canonical corpus changes only through reviewed, version-controlled publication—not direct browser mutation.

**Exit gate:** unauthorized transitions fail at the database/RPC boundary; all accepted changes have traceable source and review history.

## Phase 5 — Knowledge Graph (v0.21.x)

- Structured nodes for texts, paragraphs, Pāḷi terms, doctrinal concepts, editions, and translations.
- Typed edges with provenance citations and reviewer status.
- Graph filtering and keyboard-accessible list alternative.
- No unsupported auto-generated relationship may be labeled as canonical fact.

**Exit gate:** each published edge has a source or editorial rationale; graph records are validated and exportable.

## Phase 6 — AI-Assisted Research (v0.22.x+)

- Server-side/Edge Function integration only; never expose AI provider secrets in static frontend bundles.
- Retrieval constrained to selected, licensed, source-identified materials.
- Claim-level citations, source excerpts, uncertainty labels, and explicit distinction between text evidence and interpretation.
- Translation drafts and comparison tools with human review before publication.
- Rate limits, abuse controls, privacy policy, usage accounting, and prompt-injection defenses for retrieved documents.

**Exit gate:** citation precision is evaluated on a test set; unsupported claims are flagged; no AI output is automatically published to canonical text.

## Cross-cutting quality gates for every phase

- Architecture and static-export compatibility.
- TypeScript and production build.
- Corpus/index validation and regression tests.
- Responsive checks at 360, 480, 768, 1024, and 1440 CSS pixels.
- Keyboard navigation, focus visibility, semantic labels, and reduced-motion support.
- RLS/RPC authorization tests for any private or privileged data path.
- Dependency audit and sanitized ZIP inspection.
- Updated release notes, migration instructions, setup guide, validation evidence, and checksum.


## Follow-up refinement scope

The v0.16.0 follow-up includes permission descriptions, a guarded account-deletion workflow (requires Edge Function deployment), avatar metadata synchronization, icon-only Search Settings, consistent occurrence-card spacing, and replacing decorative emoji glyphs with SVG icons. These changes require full release validation on the supported Node/npm toolchain before publication.
