# API Specification Outline

The public API will use `/api/v1`.

## Works

`GET /api/v1/works`

`GET /api/v1/works/{workId}`

## Paragraphs

`GET /api/v1/paragraphs/{paragraphId}`

## Search

`GET /api/v1/search?q=mettā`

Query parameters:

- `q`
- `collection`
- `language`
- `text_type`
- `edition`
- `limit`
- `cursor`

## Dictionary

`GET /api/v1/dictionary/{headword}`

## Concepts

`GET /api/v1/concepts/{conceptId}`

## People

`GET /api/v1/people/{personId}`

## Places

`GET /api/v1/places/{placeId}`

## API requirements

- OpenAPI document
- versioning
- rate limiting
- pagination
- stable IDs
- machine-readable errors
- CORS policy
- API keys for higher-rate clients
- no exposure of privileged database credentials
