# Phase 1.3 architecture

## Why this phase exists

The public site remains statically exportable. Research data is still local JSON so the repository is reproducible and GitHub Pages can build it without a server.

## Data boundaries

`corpus.json` contains text records. `dictionary.json` contains dictionary records. `sources.json` contains provenance registry records. These are deliberately separate so a future import pipeline can add source-specific dictionaries without rewriting the reader.

## Next architectural boundary

Phase 2 should introduce normalized relational data for occurrences, dictionary senses, commentary segments, cross-references and citations. The static starter JSON should remain a release artifact generated from canonical source data rather than becoming the only source of truth.

## Recommended next implementation order

1. Canonical source registry and license review.
2. Edition/translation comparison model.
3. Occurrence index linking paragraph → headword → dictionary sense.
4. Aṭṭhakathā and ṭīkā segment model.
5. Citation/export service.
6. Only then move the research layer behind an API/database.
