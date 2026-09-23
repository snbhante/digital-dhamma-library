# Search Architecture

## Phase 1

Use a generated local index over the repository dataset.

Search pipeline:

```text
Query
 ↓
Unicode normalization
 ↓
Pāḷi/Bengali transliteration normalization
 ↓
Tokenization
 ↓
Exact/prefix matching
 ↓
Metadata filtering
 ↓
Ranked results
 ↓
Stable citation
```

## Required query types

- exact
- phrase
- prefix
- boolean
- metadata filtered

## Future

PostgreSQL full-text search can become the primary structured search layer. A dedicated search engine can be introduced later if corpus size and fuzzy/semantic requirements justify it.

Search indexes must always be generated from versioned source data; they are never the authoritative source.
