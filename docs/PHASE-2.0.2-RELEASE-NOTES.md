# Phase 2.0.2 Release Notes

Version: 0.5.2

## Fixed

### 1. Duplicate React keys on the occurrence index

The research occurrence generator previously appended one reference for every token match. When a token appeared multiple times in the same paragraph, the generated `references` array contained duplicate `workId + paragraphId` pairs. The occurrence page rendered those references as sibling links, producing React warnings such as `sn35.28-sn35.28.p002`.

The generator now preserves the real token `count` while storing each paragraph reference only once. Each occurrence record also exposes `paragraphCount`.

### 2. Stronger data validation

Validation now rejects duplicate occurrence paragraph references, checks `paragraphCount`, and verifies every occurrence reference against known work and paragraph IDs.

### 3. Reader and comparison defensive deduplication

The reader and comparison views now defensively deduplicate paragraphs by stable identity before rendering. This protects the UI from future corpus merges or imported datasets containing repeated paragraph records.

## Verification

Run with Node.js 24.21.0 and npm 12.1.0:

```powershell
npm ci
npm run build:research-index
npm run validate:data
npm run typecheck
npm run build
npm run dev
```

The expected research-index validation should contain no duplicate occurrence-reference errors.
