# Search Architecture

## Phase 1.2

The public reader uses a generated local search over the versioned `data/corpus.json` dataset. The browser search is intentionally dependency-free so the static GitHub Pages deployment remains simple.

Search pipeline:

```text
Query
 ↓
Unicode NFKC normalization
 ↓
Phrase extraction for quoted text
 ↓
Term matching
 ↓
Field selection
 ↓
Collection/type/language filters
 ↓
Result limit
 ↓
Stable paragraph link
```

## Supported query behavior

- all-field search
- Pāḷi-only search
- English-only search
- বাংলা-only search
- metadata search
- quoted phrase search
- AND matching for multiple terms
- collection filter
- type filter
- language filter
- result limit

## Future search layers

The current browser search is appropriate for the starter corpus. As the corpus grows, search should move to a generated static index and eventually PostgreSQL full-text search or a dedicated search engine. Fuzzy, morphological, and semantic search should be added only after the authoritative source data and stable identifiers are mature.

Search indexes must always be generated from versioned source data; they are never the authoritative source.
