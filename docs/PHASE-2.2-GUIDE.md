# Phase 2.2 Guide

## Main research routes

- `/edition-witnesses/` — bundled and planned edition witness records.
- `/compare/[workId]/` — comparison view that refuses to invent alternate witnesses.
- `/alignments/` — paragraph baseline plus sentence-level heuristic alignments.
- `/morphology/` — starter lemma/form analyses and derivation records.
- `/citations/` — reusable citation profiles.
- `/review/` — browser-local review queue.

## Review status model

`UNREVIEWED` → no review decision has been recorded.

`NEEDS_REVIEW` → item requires human verification.

`VERIFIED` → marked as checked in the current review context.

`REJECTED` → marked as unsuitable or incorrect in the current review context.

The static site stores review decisions in `localStorage`. The Supabase migration provides the authenticated `research_annotations` table for a future account-backed workflow.

## Alternate editions

The project never generates a fake alternate edition by duplicating the starter text. A future witness must carry edition identity, source, license, provenance, checksum, and verification status before it can be treated as a comparison witness.
