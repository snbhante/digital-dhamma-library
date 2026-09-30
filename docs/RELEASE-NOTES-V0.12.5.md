# Digital Dhamma Library — v0.12.5

## Phase 3 Local Data Mobility Update

### Features

- **Research Review Export & Import:** Added intuitive `Export reviews` and `Import reviews` functionality to the `ReviewWorkbench` dashboard (`/review`). This allows developers and editors to easily export their current local review decisions (which mark `VERIFIED`, `REJECTED`, or `NEEDS_REVIEW` states for paragraph alignments, morphology, and token occurrences) into a portable JSON file.
- **Workflow Unlock:** This feature allows editors to merge reviews across different browsers or machines manually. This bridges the gap for collaborative research review before the fully authenticated role-based access control (RBAC) editorial platform is built in Phase 4.

### Preserved

- The core canonical Git corpus remains strictly separated from these local review notes.
- Import logic safely handles invalid JSON structures and falls back gracefully.
- The UI retains responsive compliance across all device viewports.
