# Phase 2.1 Release Notes

Version: **0.6.0**

Phase 2.1 extends the Phase 2 research engine without changing stable work or paragraph identifiers.

## Added

- Punctuation-based starter sentence segmentation in `data/sentences.json`.
- Paragraph-level English/Bangla translation alignment records in `data/translation-alignments.json`.
- Lemma-aware occurrence metadata in `data/occurrences.json`.
- Dictionary source adapter registry in `data/dictionary-sources.json`.
- Starter compound and lexical-form metadata in `data/derivations.json`.
- Research pages for sentences, alignments, dictionary adapters, and derivations.
- Lemma/surface/both search modes on the occurrence index.
- Phase 2.1 Supabase migration `0003_phase_2_1_research.sql`.
- Expanded validation for the new research resources.

## Research integrity

Sentence segmentation is punctuation-based and marked `starter`. Translation alignment is paragraph-level and marked `starter`. Lemma assignments are derived from the project's small morphology index and are not a complete morphological parser. Compound/formation records are research aids and should be checked against authoritative Pāḷi grammar and commentarial sources.

No protected external dictionary dataset is bundled. Dictionary adapters are metadata contracts only until rights and source editions are verified.

## Stable identifiers

Existing work IDs and paragraph IDs are unchanged. Sentence IDs are derived from paragraph IDs, e.g. `mn10.p003.s001`.
