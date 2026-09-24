# Phase 2 Research Data Model

```text
Source
  └── Edition
       └── Work
            └── Paragraph
                 └── Sentence (future)
                      └── Word occurrence (future)

Work ──< Translation
Work ──< Commentary / Ṭīkā
Work ──< Cross-reference >── Work
Dictionary Source ──< Entry ──< Sense ──< Form
Form ──< Occurrence >── Paragraph
```

Stable public IDs remain text-friendly (`mn10`, `mn10.p001`). Database UUIDs are reserved for application records that need mutation or ownership.
