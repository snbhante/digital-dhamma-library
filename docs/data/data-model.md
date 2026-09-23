# Data Model

## Text hierarchy

```text
Collection
  └── Work
       └── Section
            └── Paragraph
                 └── Sentence
                      └── Word
```

## Stable identifier convention

Examples:

- `dn16`
- `dn16.p001`
- `mn10`
- `mn10.p001`
- `sn56.11`
- `sn56.11.p001`

Public identifiers must be immutable. If an edition changes, create a new edition/version rather than silently changing the identity of an existing record.

## Canonical record

```json
{
  "id": "mn10.p001",
  "work_id": "mn10",
  "number": 1,
  "language": "pli",
  "text": "...",
  "source_id": "source-001",
  "edition_id": "edition-001",
  "license_id": "license-001"
}
```

## Provenance

Every public text record must be traceable to:

- source
- edition
- editor/digitizer where known
- publication metadata
- original URL
- license
- import version
- checksum

## Text categories

Use explicit values:

- `CANONICAL`
- `COMMENTARIAL`
- `SUBCOMMENTARIAL`
- `LATER_TRADITION`
- `HISTORICAL`
- `SCHOLARLY`
- `TRANSLATION`
- `MODERN`
- `USER_CONTRIBUTED`

Do not collapse these categories into a single undifferentiated "Buddhist text" label.
