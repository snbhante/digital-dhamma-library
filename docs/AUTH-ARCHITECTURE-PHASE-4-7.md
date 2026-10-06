# Digital Dhamma Library — Auth / User / Workspace / Contributor / Admin Architecture

## Release baseline

**v0.13.1 / Phase 4.1 foundation**

This document merges the Auth Architecture blueprint with the current GitHub Pages/static application model.

## 1. Security model

```text
Public visitor
    ↓
Public reader / search / dictionary
    ↓ optional sign-in
Supabase Auth
    ↓
JWT session + profiles
    ↓
Roles → Permissions
    ↓
Browser client ───────────────┐
    ↓                          │
Supabase REST/PostgREST        │
    ↓                          │
PostgreSQL + RLS ◄─────────────┘
```

The browser receives only the Supabase publishable/anon key. A service-role/secret key must never be placed in a `NEXT_PUBLIC_*` variable.

GitHub Pages is static hosting, so privileged server actions are deliberately not implemented in the static client. Database RLS, `SECURITY DEFINER` authorization helpers, and future server/API deployment boundaries are the security controls.

## 2. Identity model

Supabase Auth owns the authentication identity:

- UUID user ID
- email
- email confirmation state
- authentication timestamps
- user metadata
- JWT access/refresh session

`public.profiles` owns application profile data:

- display name
- avatar URL
- bio
- interface language
- public profile preference
- preferences JSON
- contributor handle
- account status
- suspension reason
- last-seen timestamp

A database trigger provisions a profile and assigns the default `READER` role after signup.

## 3. Canonical roles

```text
GUEST
READER
CONTRIBUTOR
TRANSLATOR
RESEARCHER
EDITOR
MODERATOR
ADMIN
SUPER_ADMIN
```

Roles are stored in `roles`; assignments are stored in `user_roles`.

## 4. Permission model

Permissions are the actual authorization boundary. Current canonical keys include:

- `content.read`
- `content.create`
- `content.edit`
- `content.review`
- `content.publish`
- `content.delete`
- `dictionary.read`
- `dictionary.edit`
- `media.create`
- `media.edit`
- `media.delete`
- `user.read`
- `user.edit`
- `user.suspend`
- `role.assign`
- `comment.moderate`
- `source.manage`
- `license.manage`
- `audit.read`

The database exposes `has_role(text)` and `has_permission(text)` as controlled `SECURITY DEFINER` functions.

## 5. Workspace model

```text
Local-first workspace
  ├── bookmarks
  ├── notes
  ├── saved searches
  └── collections
          ↓
      JSON snapshot
          ↓
 Supabase workspace_snapshots
```

The existing local storage key remains unchanged to protect continuity with previous releases.

## 6. Contributor workflow

```text
DRAFT
  ↓
SUBMITTED
  ↓
IN_REVIEW
  ├── CHANGES_REQUESTED → contributor revision
  ├── REJECTED
  └── APPROVED
          ↓
      PUBLISHED
```

Submissions are stored separately from the canonical Git corpus. A contributor cannot directly overwrite canonical text.

## 7. Editorial entities

- `editorial_submissions`
- `editorial_reviews`
- `media_assets`
- `audit_logs`

All privileged operations are RLS protected.

## 8. Account lifecycle

```text
ACTIVE → SUSPENDED → ACTIVE
ACTIVE → DEACTIVATED
```

Authorization helpers only grant effective role/permission access to an `ACTIVE` profile.

## 9. Client architecture

```text
AuthProvider
   ├── session
   ├── user
   ├── roles
   ├── permissions
   └── authorization refresh

AccessGate
   ├── AuthenticatedGate
   └── RoleGate

lib/authz.ts
   ├── role constants
   ├── permission constants
   ├── hasRole
   ├── hasAnyRole
   ├── hasPermission
   └── hasAnyPermission
```

UI gates are convenience/UX controls. They are not the security boundary; PostgreSQL RLS remains authoritative.

## 10. Phase roadmap

### Phase 4 — Editorial Platform

- Contributor dashboard
- Draft/submission management
- Reviewer queue
- Editorial status transitions
- Source/provenance management
- License review
- Media metadata workflow
- Moderation tools
- Audit history
- Role/permission administration

### Phase 5 — Media & Synchronization

- Audio library
- Video library
- Image/document records
- Pāḷi paragraph ↔ audio timestamp alignment
- Pāḷi paragraph ↔ video timestamp alignment
- transcript synchronization
- media collections
- rights/creator/license verification
- offline media metadata
- PWA media handlers

### Phase 6 — Public API & Developer Platform

- Hosted API runtime separate from GitHub Pages
- OpenAPI 3 specification
- API key management
- scoped API permissions
- rate limiting
- usage quotas
- dataset release manifests
- versioned corpus snapshots
- webhooks/event delivery
- developer portal
- SDKs and examples

### Phase 7 — Scholarly Intelligence

- PostgreSQL full-text search
- multilingual token normalization
- fuzzy search
- semantic/vector search
- morphology engine
- sandhi and compound analysis
- OCR correction workflow
- witness comparison/diffing
- knowledge graph
- citation-first research assistant
- retrieval-augmented research with provenance
- reproducible research bundles

## 11. Static-hosting boundary

The project deliberately does **not** expose:

- service-role keys
- secret API keys
- privileged server-only credentials
- direct browser-side canonical corpus writes

When a future feature requires privileged computation, deploy it as a separate server/API/Edge Function layer and keep the GitHub Pages application as the public/static client.
