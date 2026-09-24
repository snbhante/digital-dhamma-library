# Phase 2 Architecture

## 1. Canonical text layer

`works -> paragraphs` remains the stable public reader model. Future normalized sentence/word segmentation must never destroy the original paragraph text.

## 2. Edition layer

An edition identifies a concrete textual witness or digital edition. A work may point to one edition in the starter corpus, while future records can point to multiple editions.

Required metadata: edition ID, title, editor/publisher where known, year, source URL, license, checksum/version, import date, verification status.

## 3. Translation layer

Translations are independent resources linked to a work/edition. Never overwrite canonical Pāḷi when importing a translation.

## 4. Dictionary layer

Dictionary source -> entry -> sense -> form -> occurrence. Each sense must retain its dictionary source and edition metadata.

## 5. Morphology layer

Phase 2 ships a starter form index only. A future parser should produce lemma, POS, morphology features, confidence, source, and rule/model version. Parser output must be distinguishable from human-reviewed analysis.

## 6. Occurrence layer

The static starter index maps exact normalized Pāḷi tokens to stable paragraph IDs. A future server index can add lemma, surface form, position, sentence ID, and edition ID.

## 7. Commentary layer

Aṭṭhakathā and Ṭīkā are modeled as separate works/resources. Commentary text is not imported merely because it is available on the internet; redistribution rights must be verified record by record.

## 8. Cross-reference layer

Cross-references are explicit edges with a relation type and provenance. `research-related` is a navigational relation, not a claim of textual dependence.

## 9. Citation layer

Every citation should be reproducible through a stable work ID, paragraph ID, edition, URL, and optional translation/dictionary source. Export formats currently include plain text, Markdown, and BibTeX.

## 10. Static vs dynamic boundary

GitHub Pages serves the public research reader from versioned JSON. Supabase/PostgreSQL is reserved for authenticated user data and future editorial/research indexes. This keeps the public corpus auditable in Git while avoiding client-side database credentials.
