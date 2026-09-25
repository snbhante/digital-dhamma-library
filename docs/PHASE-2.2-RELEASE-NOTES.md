# Phase 2.2 — Research Review & Provenance Layer

Version: 0.7.0

## Added

- Edition witness registry.
- Explicit metadata-only slots for future alternate editions.
- Sentence-level heuristic translation alignment records.
- Browser-local review queue for sentence alignments, occurrences, and morphology analyses.
- Starter morphology analysis records with provenance and review status.
- Citation profiles: Plain, Markdown, BibTeX, APA-style, and Chicago-style.
- Supabase migration for edition witnesses, sentence alignments, morphology analyses, citation profiles, and authenticated research annotations.
- New routes:
  - `/edition-witnesses/`
  - `/morphology/`
  - `/citations/`
  - `/review/`

## Research integrity

The release does **not** claim that a punctuation-based sentence split is a scholarly sentence segmentation, nor that ordinal translation matching is a verified alignment. These records are explicitly marked for review.

The release also does **not** fabricate alternate-edition readings. The witness registry records the bundled starter witness and creates metadata-only slots for independently sourced editions that can be imported later after source, license, checksum, provenance, and review verification.

Browser-local review status is preparatory infrastructure. It is not an authenticated public scholarly verification record. Authenticated reviewer identity, audit logs, and editorial workflow remain part of later platform phases.
