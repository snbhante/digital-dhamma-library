# Public data

Only publish data that the project has the legal right to redistribute.

## Current starter corpus

`corpus.json` is intentionally larger in Phase 1.2 so that search, reader navigation, multilingual display, filtering, and stable-ID behavior can be tested against a more realistic dataset. It is a **structured starter corpus**, not a claim of a complete critical edition or a replacement for a licensed Tipiṭaka edition.

The Pāḷi passages are ancient canonical material; the project-curated English and Bangla translations in this starter dataset are written for application testing. Each record carries provenance and a redistribution-rights warning so that future imports can replace or supplement these records with explicitly verified editions.

## Future dataset contract

Each released dataset should eventually contain:

- `dataset.json`
- `sources.json`
- `editions.json`
- `licenses.json`
- machine-readable records
- checksums
- import/version metadata
- human-review status

Internet availability alone is never treated as permission to redistribute copyrighted editions or translations.


## Phase 1.3 data layers

- `corpus.json` — starter text corpus.
- `dictionary.json` — small project-curated research dictionary prototype; not a third-party dictionary.
- `sources.json` — stable source/provenance registry for future imports.

All data remains subject to record-level provenance and license review.
