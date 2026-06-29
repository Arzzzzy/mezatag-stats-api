# Mezatag Stats API

Public read-only API for Mezatag Pokemon details, move metadata, and version availability.

**Base URL**

```txt
https://api.mezastarhub.site/api/pokemon-stats
```

## Overview

This API exposes public Mezatag roster and stat data in a simple JSON format.
It is built by merging the roster catalog with curated stat records, then labeling
each entry with a publication status.

- Read-only access
- No API key required
- Version-aware responses
- Detail lookup by slug
- Completion tracking with `statsStatus`

## How The Data Is Curated

The API resolves entries from two local sources:

- `src/data/mezastarRosters.js` defines the catalog of supported tags
- `src/data/mezatagPokemonStats.js` provides the curated stats, labels, and overrides

At request time, the resolver merges the roster entry with the matching curated record.
If a roster entry has no curated record yet, it is returned as `missing`.
If it has partial stat data, it is returned as `incomplete`.
If the stat record is complete, it is returned as `ready`.

The current curated source label used in published records is `mezastarhub.site/api`.

## Coverage

Current curation status by version:

| Version | Status |
| --- | --- |
| `stardust_v1` | Curated and published |
| `stardust_v2` | Curated and published |
| `Special` | Rostered, stats pending |
| `stardust_v3` | Curated and published |
| `stardust_v4` | Curated and published |
| `galaxy_v1` | Curated and published |
| `galaxy_v2` | Rostered, stats pending |
If you need the full catalog, including unfinished entries, use `includeEmpty=true`.

## Quick Start

### Get all published entries

```txt
GET https://api.mezastarhub.site/api/pokemon-stats
```

### Get the full catalog, including incomplete entries

```txt
GET https://api.mezastarhub.site/api/pokemon-stats?includeEmpty=true
```

### Group entries by version

```txt
GET https://api.mezastarhub.site/api/pokemon-stats?groupByVersion=true
```

### Get one Pokemon by slug

```txt
GET https://api.mezastarhub.site/api/pokemon-stats/mewtwo-1-1-001
```

### Get one entry even if it is incomplete

```txt
GET https://api.mezastarhub.site/api/pokemon-stats/mewtwo-1-1-001?allowEmpty=true
```

## Endpoints

### `GET /api/pokemon-stats`

Returns published Mezatag entries only. Published means `statsStatus === "ready"`.

### `GET /api/pokemon-stats?includeEmpty=true`

Returns the full catalog, including entries whose stats are incomplete or missing.

### `GET /api/pokemon-stats?groupByVersion=true`

Returns published entries grouped by `versionIdentifier`.

### `GET /api/pokemon-stats/:slug`

Returns one published entry by slug.

### `GET /api/pokemon-stats/:slug?allowEmpty=true`

Returns one entry by slug even if its stats are not fully curated yet.

## Query Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `includeEmpty` | boolean | Includes incomplete or missing entries in list responses |
| `groupByVersion` | boolean | Groups list responses by version |
| `allowEmpty` | boolean | Allows detail responses for incomplete or missing entries |
| `number` | string | Looks up a single entry by Mezatag number from the list route |

## Response Format

### List response

```json
{
  "success": true,
  "data": [],
  "meta": {}
}
```

### Detail response

```json
{
  "success": true,
  "data": {}
}
```

### Error response

```json
{
  "success": false,
  "error": {
    "code": "POKEMON_NOT_FOUND",
    "message": "No Mezatag Pokemon entry matches \"example-slug\"."
  }
}
```

## Example Entry

```json
{
  "slug": "mewtwo-1-1-001",
  "number": "1-1-001",
  "tagId": "1-1-001",
  "versionIdentifier": "stardust_v1",
  "versionLabel": "STARDUST Version 1",
  "pokemonId": 150,
  "name": "Mewtwo",
  "form": "Normal",
  "type": "Psychic",
  "types": ["Psychic"],
  "star": 6,
  "attack": "Psystrike",
  "attackType": "Psychic",
  "pokeEne": 158,
  "pe": 158,
  "marks": ["Legend"],
  "rarity": "6 star",
  "traits": [],
  "item": null,
  "move": {
    "name": "Psystrike",
    "type": "Psychic",
    "category": "Special"
  },
  "secondMove": null,
  "stats": {
    "hp": 172,
    "attack": 119,
    "defense": 98,
    "specialAttack": 165,
    "specialDefense": 98,
    "speed": 140
  },
  "statsStatus": "ready",
  "isPlaceholder": false,
  "source": "mezastarhub.site/api",
  "lastUpdated": null,
  "notes": null,
  "links": {
    "self": "/api/pokemon-stats/mewtwo-1-1-001"
  }
}
```

## Entry Status

Entries can include a `statsStatus` field:

| Value | Meaning |
| --- | --- |
| `ready` | Fully curated and published |
| `incomplete` | Partially filled in |
| `missing` | Present in the roster but not yet curated |

The response also carries version context through `versionIdentifier` and
`versionLabel`, so clients can group records consistently even when a version
has roster entries with no curated stats yet.

## Repository Contents

| Path | Purpose |
| --- | --- |
| `api/pokemon-stats/index.js` | List route |
| `api/pokemon-stats/[slug].js` | Detail route |
| `src/data/mezastarRosters.js` | Base Mezatag roster data |
| `src/data/mezatagPokemonStats.js` | Curated stat records and overrides |
| `src/lib/mezatagStatsApi.js` | Request resolver and response builder |
| `src/lib/mezatagStatsFormatter.js` | Data normalization and formatting helpers |

## Local Check

```bash
npm run check
```

## License

MIT
