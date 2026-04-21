# Mezatag Stats API

Public read-only API for Mezatag Pokemon details, move metadata, and version availability.

**Base URL**

```txt
https://api.mezastarhub.site/api/pokemon-stats
```

## Overview

This API exposes public Mezatag roster and stat data in a simple JSON format.

- Read-only access
- No API key required
- Version-aware responses
- Detail lookup by slug
- Completion tracking with `statsStatus`

## Coverage

Current curation status by version:

| Version | Status |
| --- | --- |
| `stardust_v1` | Curated |
| `stardust_v2` | Curated |
| `Special` | Curated |
| `stardust_v3` | Not fully curated yet |
| `stardust_v4` | Not fully curated yet |
| `galaxy_v1` | Not fully curated yet |

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

Returns published Mezatag entries only.

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
  "versionLabel": "Stardust v1",
  "pokemonId": 150,
  "name": "Mewtwo",
  "form": "Normal",
  "type": "Psychic",
  "star": 6,
  "attack": "Psystrike",
  "attackType": "Psychic",
  "pokeEne": 158,
  "pe": 158,
  "marks": ["Legend"],
  "rarity": "6 star",
  "traits": [],
  "move": {
    "name": "Psystrike",
    "type": "Psychic",
    "category": "Special"
  },
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
  "source": "pokeapi-base-stats",
  "lastUpdated": "2026-04-16",
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
