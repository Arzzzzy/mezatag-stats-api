# Mezatag Stats API

Public read-only API for Mezatag Pokemon details, move metadata, and per-version availability.

This repo contains the public data files and API route handlers for a read-only Mezatag stats API. It does not depend on Firebase, auth, or any Mezastar Hub frontend code.

## Current Coverage

The API already exposes all roster buckets, but the detailed stat curation is still in progress for some versions.

- `stardust_v1`: curated
- `stardust_v2`: curated
- `Special`: curated
- `stardust_v3`: not fully curated yet
- `stardust_v4`: not fully curated yet
- `galaxy_v1`: not fully curated yet

If you need the full catalog regardless of completion state, call `GET /api/pokemon-stats?includeEmpty=true` and inspect each record's `statsStatus`.

## How To Access The API

This repo exposes two API route files:

- `api/pokemon-stats/index.js`
- `api/pokemon-stats/[slug].js`

That means the API path is always based on the host where this repo is running:

```txt
https://your-domain.com/api/pokemon-stats
https://your-domain.com/api/pokemon-stats/:slug
```

Examples:

```txt
https://your-domain.com/api/pokemon-stats
https://your-domain.com/api/pokemon-stats?includeEmpty=true
https://your-domain.com/api/pokemon-stats?groupByVersion=true
https://your-domain.com/api/pokemon-stats/mewtwo-1-1-001
https://your-domain.com/api/pokemon-stats/mewtwo-1-1-001?allowEmpty=true
```

If you publish this repo on a hosting platform that supports file-based serverless routes, users will access the API through that host plus `/api/pokemon-stats`.

## Routes

### `GET /api/pokemon-stats`
Returns published Mezatag entries only.

### `GET /api/pokemon-stats?includeEmpty=true`
Returns the full catalog, including entries whose stats are incomplete or still missing.

### `GET /api/pokemon-stats?groupByVersion=true`
Groups the published entries under each version identifier.

### `GET /api/pokemon-stats/:slug`
Returns a single published record by slug.

### `GET /api/pokemon-stats/:slug?allowEmpty=true`
Returns a single record even when its stats are incomplete or missing.

## Query Parameters

- `includeEmpty=true`
  Includes entries whose stats are incomplete or still missing.
- `groupByVersion=true`
  Groups the list response by version identifier.
- `allowEmpty=true`
  Allows detail responses for entries that are not fully curated yet.
- `number=<tag-number>`
  Looks up one entry by Mezatag number from the list endpoint.

## Example Response

```json
{
  "success": true,
  "data": [
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
  ],
  "meta": {
    "endpoint": "/api/pokemon-stats",
    "includeEmpty": false,
    "total": 280,
    "ready": 280,
    "incomplete": 0,
    "missing": 0
  }
}
```

## Usage Notes

The main resolver lives in `src/lib/mezatagStatsApi.js`.

The route files call that resolver and return JSON responses with:

- `success`
- `data`
- `meta` for list responses
- `error` for failed requests

Records that are not fully curated yet expose a `statsStatus` field:

- `ready`
- `incomplete`
- `missing`

## Repo Check

To sanity-check the route and library files:

```bash
npm run check
```

## Data Files

- `src/data/mezastarRosters.js`
  Base roster data by Mezatag version.
- `src/data/mezatagPokemonStats.js`
  Published stat records and manual detail overrides.
- `src/lib/mezatagStatsFormatter.js`
  Utilities for sorting, normalizing, serializing, and importing stat records.

## License

MIT
