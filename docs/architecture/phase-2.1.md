# Phase 2.1 Architecture

## Research index pipeline

```text
corpus.json + dictionary.json
        ↓
build-research-index.mjs
        ├── editions.json
        ├── translations.json
        ├── morphology.json
        ├── occurrences.json
        ├── sentences.json
        ├── translation-alignments.json
        ├── dictionary-sources.json
        ├── derivations.json
        └── cross-references.json
        ↓
validate-data.mjs
        ↓
Next.js static build
```

## Stable identifiers

Paragraph IDs remain immutable. Sentence IDs are derived from paragraphs:

- `mn10.p003`
- `mn10.p003.s001`
- `mn10.p003.s002`

A future reviewed sentence segmentation can replace sentence records without changing the paragraph identity.

## Lemma-aware occurrences

Occurrence records retain the surface token and normalized token. A lemma is attached only when it can be mapped from the starter morphology index. Unknown tokens remain `null`; the system must not fabricate a lemma.

## Translation alignment

Phase 2.1 uses paragraph-level 1-to-1 alignment for the existing project-curated translations. Sentence-level alignment is deliberately left as a review task for Phase 2.2 because punctuation alone is not sufficient evidence for reliable sentence alignment.

## Dictionary adapters

The adapter registry stores mapping contracts and license status, not protected dictionary content. External dictionaries must be imported only after verifying source edition, license, attribution, and redistribution rights.

## Formation metadata

`derivations.json` distinguishes `FORM_OF` and `COMPOUND` relationships. Records are marked `starter` and include a research note. They are not treated as authoritative grammatical derivations.
