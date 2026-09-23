# Dataset Specification

A release-ready dataset should have this structure:

```text
dataset/
├── dataset.json
├── sources.json
├── editions.json
├── licenses.json
├── works/
│   ├── mn10.json
│   └── ...
└── checksums.sha256
```

## dataset.json

```json
{
  "id": "example-mn",
  "name": "Example Majjhima Nikāya dataset",
  "version": "0.1.0",
  "language": ["pli"],
  "text_type": "CANONICAL",
  "license": "SEE-LICENSE-REGISTRY",
  "source_ids": ["source-001"],
  "generated_at": "2026-01-01T00:00:00Z"
}
```

## Rule

The raw source representation should be retained whenever licensing permits. Normalized/search representations are derived artifacts and must be regenerable.
