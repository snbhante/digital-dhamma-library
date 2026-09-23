# Contributing

Thank you for helping build an open Buddhist research resource.

## Contribution categories

- Code
- Data normalization
- Pāḷi text corrections
- Translation metadata
- Dictionary records
- Cross-references
- Concepts
- People and places
- Documentation
- Accessibility
- Testing

## Canonical-text rule

Contributors must not silently rewrite a source text.

A correction should include:

- stable record ID
- current value
- proposed value
- reason
- source/edition
- page or location where applicable
- contributor identity
- review status

## Review flow

```text
Contributor
    ↓
Pull request / contribution
    ↓
Automated validation
    ↓
Editor review
    ↓
Approve / request changes
    ↓
Merge
    ↓
Build + test
    ↓
Publish
```

## Licensing

Do not submit material unless its redistribution status is documented.

Acceptable metadata states include:

- public-domain
- CC0
- CC BY
- CC BY-SA
- permission-granted
- restricted
- unknown

Restricted/unknown material must not be published as downloadable repository data.

## Code standards

- TypeScript
- strict type checking
- accessible HTML
- no secrets in source control
- tests for non-trivial logic
- stable identifiers for public records
