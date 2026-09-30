# Digital Dhamma Library — v0.13.0

## Phase 4 Editorial Platform Setup

### Features

- **Editorial Schema Migrations:** Added `supabase/migrations/0007_phase_4_editorial.sql` defining the initial infrastructure for the Phase 4 authenticated editorial platform.
- **Role-Based Access Control (RBAC):** Introduced a new `user_role` type (`reader`, `contributor`, `editor`, `admin`) to securely govern cloud modifications.
- **User Profiles:** Created a `profiles` table to manage display names, contributor handles, and bios. A trigger automatically provisions a basic `reader` profile upon Supabase signup.
- **Global Review Queue:** Created the `editorial_reviews` table. Moving forward, verified annotations from local-first environments can be pushed into this global cloud queue, where authorized editors can track consensus.
- **Audit Logging:** Created an `audit_logs` table designed to provide immutable historical records of any accepted corpus changes or editorial decisions.

### Security

- Row-Level Security (RLS) is strictly enforced:
  - Profiles are publicly readable, but only updatable by the profile owner.
  - Review queue records are publicly readable, but strictly gated to `editor` and `admin` roles for inserts and updates.
  - Audit logs are tightly gated to `admin` read access and are exclusively inserted via backend triggers.

### Preserved

- The existing Workspace 2.0 local storage, cloud synchronization logic, and client-side review dashboard (`/review`) are fully preserved while this migration is safely deployed to the production Supabase database.
