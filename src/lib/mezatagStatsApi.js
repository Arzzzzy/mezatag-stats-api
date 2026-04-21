import { MEZASTAR_ROSTERS } from '../data/mezastarRosters.js';
import { MEZATAG_POKEMON_STATS } from '../data/mezatagPokemonStats.js';

const API_BASE_PATH = '/api/pokemon-stats';
const STAT_KEYS = ['hp', 'attack', 'defense', 'specialAttack', 'specialDefense', 'speed'];
const MOVE_CATEGORY_BY_NAME = {
  aeroblast: 'Special',
  'apple acid': 'Special',
  'astral barrage': 'Special',
  'aura sphere': 'Special',
  'behemoth bash': 'Physical',
  'behemoth blade': 'Physical',
  'bitter malice': 'Special',
  blizzard: 'Special',
  'body slam': 'Physical',
  'brave bird': 'Physical',
  'close combat': 'Physical',
  'collision course': 'Physical',
  'cross chop': 'Physical',
  'dark pulse': 'Special',
  'dazzling gleam': 'Special',
  'draco meteor': 'Special',
  'dragon claw': 'Physical',
  'dragon energy': 'Special',
  'dragon pulse': 'Special',
  'dragon rush': 'Physical',
  'drum beating': 'Physical',
  'dynamax cannon': 'Special',
  'earth power': 'Special',
  earthquake: 'Physical',
  'electro drift': 'Special',
  'fire blast': 'Special',
  fireblast: 'Special',
  'fishious rend': 'Physical',
  flamethrower: 'Special',
  'flare blitz': 'Physical',
  'flash cannon': 'Special',
  'focus blast': 'Special',
  'fusion bolt': 'Physical',
  'fusion flare': 'Special',
  'glacial lance': 'Physical',
  'head smash': 'Physical',
  'headlong rush': 'Physical',
  hurricane: 'Special',
  'hydro pump': 'Special',
  'ice beam': 'Special',
  'iron head': 'Physical',
  'iron tail': 'Physical',
  judgment: 'Special',
  'lands wrath': 'Physical',
  'leaf blade': 'Physical',
  'leaf storm': 'Special',
  'meteor assault': 'Physical',
  'meteor mash': 'Physical',
  moonblast: 'Special',
  'moongeist beam': 'Special',
  'night slash': 'Physical',
  outrage: 'Physical',
  overdrive: 'Special',
  'plasma fists': 'Physical',
  'play rough': 'Physical',
  psychic: 'Special',
  psystrike: 'Special',
  'pyro ball': 'Physical',
  'roar of time': 'Special',
  'rock blast': 'Physical',
  'sacred fire': 'Physical',
  'sacred sword': 'Physical',
  'secret sword': 'Special',
  'shadow ball': 'Special',
  'shadow claw': 'Physical',
  'sludge wave': 'Special',
  'snipe shot': 'Special',
  'solar beam': 'Special',
  'spacial rend': 'Special',
  'spirit break': 'Physical',
  'stone edge': 'Physical',
  'sunsteel strike': 'Physical',
  'throat chop': 'Physical',
  thunder: 'Special',
  'thunder cage': 'Special',
  thunderbolt: 'Special',
  'wild charge': 'Physical',
  'x-scissor': 'Physical',
};
const JSON_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json; charset=utf-8',
};

const MANUAL_STATS_BY_NUMBER = new Map(
  MEZATAG_POKEMON_STATS.map((record) => [record.number, record]),
);

const formatVersionLabel = (rosterKey) => {
  if (rosterKey === 'Special') {
    return 'Special';
  }

  return String(rosterKey)
    .split('_')
    .map((part, index) => {
      if (index === 0) {
        return part.charAt(0).toUpperCase() + part.slice(1);
      }

      return part.replace(/^v(\d+)$/i, 'v$1');
    })
    .join(' ');
};

const normalizeSlugPart = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const normalizeMoveKey = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const normalizeTextValue = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
};

const normalizeStatValue = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeTextValue(item))
      .filter(Boolean);
  }

  const normalized = normalizeTextValue(value);
  return normalized ? [normalized] : [];
};

const deriveTraitsFromForm = (form) => {
  const normalizedForm = normalizeTextValue(form);

  switch (normalizedForm) {
    case 'Dynamax':
      return ['Dynamax'];
    case 'Z-Move':
      return ['Z-Move'];
    case 'Mega Evolution':
      return ['Mega Evolution'];
    case 'Tag Team':
      return ['Tag Team'];
    case 'Gigantamax':
      return ['Gigantamax'];
    default:
      return [];
  }
};

const deriveMarks = (manualMarks, entry) => {
  if (manualMarks !== undefined) {
    return normalizeStringArray(manualMarks);
  }

  if (entry.star === 6) {
    return ['Legend'];
  }

  return [];
};

const normalizeStats = (stats) => {
  if (!stats) {
    return null;
  }

  return STAT_KEYS.reduce((accumulator, key) => {
    accumulator[key] = normalizeStatValue(stats[key]);
    return accumulator;
  }, {});
};

const hasCompleteStats = (stats) =>
  Boolean(stats) && STAT_KEYS.every((key) => Number.isFinite(stats[key]));

const normalizeNullableNumber = (value, fallback = null) => {
  const normalized = normalizeStatValue(value);
  return normalized ?? fallback;
};

const deriveMoveCategory = (moveName) => {
  const primaryMoveName = normalizeTextValue(moveName)?.split('/')[0]?.trim();

  if (!primaryMoveName) {
    return null;
  }

  return MOVE_CATEGORY_BY_NAME[normalizeMoveKey(primaryMoveName)] ?? null;
};

const normalizeMove = (move, entry) => {
  const normalizedMove = {
    name: normalizeTextValue(move?.name ?? entry.attack),
    type: normalizeTextValue(move?.type ?? entry.attackType),
    category:
      normalizeTextValue(move?.category) ??
      deriveMoveCategory(move?.name ?? entry.attack),
  };

  return normalizedMove.name || normalizedMove.type || normalizedMove.category
    ? normalizedMove
    : null;
};

const buildCatalog = () => {
  const uniqueByNumber = new Map();

  for (const [rosterKey, rosterEntries] of Object.entries(MEZASTAR_ROSTERS)) {
    for (const entry of rosterEntries) {
      const number = entry.number;

      if (!number || uniqueByNumber.has(number)) {
        continue;
      }

      const manualRecord = MANUAL_STATS_BY_NUMBER.get(number);
      const versionIdentifier =
        normalizeTextValue(manualRecord?.versionIdentifier) ?? rosterKey;
      const versionLabel =
        normalizeTextValue(manualRecord?.versionLabel) ?? formatVersionLabel(versionIdentifier);
      const pokemonId = normalizeNullableNumber(manualRecord?.pokemonId, entry.id ?? null);
      const name = normalizeTextValue(manualRecord?.name) ?? entry.name;
      const form = normalizeTextValue(manualRecord?.form) ?? entry.form ?? 'Normal';
      const type = normalizeTextValue(manualRecord?.type) ?? entry.type ?? null;
      const star = normalizeNullableNumber(manualRecord?.star, entry.star ?? null);
      const attack = normalizeTextValue(manualRecord?.attack) ?? entry.attack ?? null;
      const attackType =
        normalizeTextValue(manualRecord?.attackType) ?? entry.attackType ?? null;
      const normalizedStats = normalizeStats(manualRecord?.stats);
      const normalizedTraits =
        manualRecord?.traits === undefined
          ? deriveTraitsFromForm(form)
          : normalizeStringArray(manualRecord.traits);
      const normalizedMarks = deriveMarks(manualRecord?.marks, { star });
      const normalizedMove = normalizeMove(manualRecord?.move, { attack, attackType });
      const pokeEne = normalizeStatValue(manualRecord?.pokeEne);
      const slug = normalizeSlugPart(`${name}-${number}`);
      const statsStatus = !manualRecord
        ? 'missing'
        : hasCompleteStats(normalizedStats)
          ? 'ready'
          : 'incomplete';

      uniqueByNumber.set(number, {
        slug,
        number,
        tagId: normalizeTextValue(manualRecord?.tagId) ?? number,
        roster: rosterKey,
        versionIdentifier,
        versionLabel,
        pokemonId,
        name,
        form,
        type,
        star,
        attack,
        attackType,
        pokeEne,
        pe: pokeEne,
        marks: normalizedMarks,
        rarity: normalizeTextValue(manualRecord?.rarity) ?? (star ? `${star} star` : null),
        traits: normalizedTraits,
        move: normalizedMove,
        stats: statsStatus === 'missing' ? null : normalizedStats,
        statsStatus,
        isPlaceholder: Boolean(manualRecord?.isPlaceholder),
        source: manualRecord?.source ?? 'roster-derived',
        lastUpdated: manualRecord?.lastUpdated ?? null,
        notes: manualRecord?.notes ?? null,
        links: {
          self: `${API_BASE_PATH}/${slug}`,
        },
      });
    }
  }

  return Array.from(uniqueByNumber.values());
};

const POKEMON_STATS_CATALOG = buildCatalog();

const findEntry = ({ slug, number }) => {
  if (number) {
    return POKEMON_STATS_CATALOG.find((entry) => entry.number === number) ?? null;
  }

  if (slug) {
    return (
      POKEMON_STATS_CATALOG.find((entry) => entry.slug === normalizeSlugPart(slug)) ?? null
    );
  }

  return null;
};

const buildMeta = (entries, includeEmpty) => {
  const readyCount = entries.filter((entry) => entry.statsStatus === 'ready').length;
  const incompleteCount = entries.filter((entry) => entry.statsStatus === 'incomplete').length;
  const missingCount = entries.filter((entry) => entry.statsStatus === 'missing').length;
  const versions = Object.entries(
    entries.reduce((accumulator, entry) => {
      const current =
        accumulator[entry.versionIdentifier] ??
        {
          identifier: entry.versionIdentifier,
          label: entry.versionLabel,
          total: 0,
          ready: 0,
          incomplete: 0,
          missing: 0,
        };

      current.total += 1;
      current[entry.statsStatus] += 1;
      accumulator[entry.versionIdentifier] = current;
      return accumulator;
    }, {}),
  ).map(([, value]) => value);

  return {
    endpoint: API_BASE_PATH,
    includeEmpty,
    total: entries.length,
    ready: readyCount,
    incomplete: incompleteCount,
    missing: missingCount,
    versions,
  };
};

const groupEntriesByVersion = (entries) =>
  Object.values(
    entries.reduce((accumulator, entry) => {
      const group =
        accumulator[entry.versionIdentifier] ??
        {
          versionIdentifier: entry.versionIdentifier,
          versionLabel: entry.versionLabel,
          entries: [],
        };

      group.entries.push(entry);
      accumulator[entry.versionIdentifier] = group;
      return accumulator;
    }, {}),
  );

const makeResponse = (status, body) => ({
  status,
  headers: JSON_HEADERS,
  body,
});

const methodNotAllowedResponse = () =>
  makeResponse(405, {
    success: false,
    error: {
      code: 'METHOD_NOT_ALLOWED',
      message: 'Only GET and OPTIONS requests are supported.',
    },
  });

const notFoundResponse = (slug) =>
  makeResponse(404, {
    success: false,
    error: {
      code: 'POKEMON_NOT_FOUND',
      message: `No Mezatag Pokemon entry matches "${slug}".`,
    },
  });

const statsNotReadyResponse = (entry) =>
  makeResponse(409, {
    success: false,
    error: {
      code: 'STATS_NOT_READY',
      message: `Stats for ${entry.name} (${entry.number}) are not published yet.`,
      details: {
        slug: entry.slug,
        number: entry.number,
        statsStatus: entry.statsStatus,
      },
    },
  });

const noPublishedStatsResponse = () =>
  makeResponse(503, {
    success: false,
    error: {
      code: 'NO_PUBLISHED_STATS',
      message:
        'No published Mezatag Pokemon stats are available yet. Add values in src/data/mezatagPokemonStats.js or call this endpoint with includeEmpty=true.',
    },
  });

export const matchPokemonStatsPath = (pathname) => {
  if (pathname === API_BASE_PATH || pathname === `${API_BASE_PATH}/`) {
    return { matched: true, slug: null };
  }

  if (!pathname.startsWith(`${API_BASE_PATH}/`)) {
    return { matched: false, slug: null };
  }

  const slug = pathname.slice(`${API_BASE_PATH}/`.length).replace(/\/+$/, '');

  return {
    matched: Boolean(slug),
    slug: slug || null,
  };
};

export const resolvePokemonStatsRequest = ({ method, url, slug = null }) => {
  if (method === 'OPTIONS') {
    return makeResponse(204, null);
  }

  if (method !== 'GET') {
    return methodNotAllowedResponse();
  }

  const includeEmpty = url.searchParams.get('includeEmpty') === 'true';
  const allowEmpty = url.searchParams.get('allowEmpty') === 'true';
  const groupByVersion = url.searchParams.get('groupByVersion') === 'true';
  const number = url.searchParams.get('number');
  const requestedSlug = slug ?? url.searchParams.get('slug');
  const requestedEntry = findEntry({ slug: requestedSlug, number });

  if (requestedSlug || number) {
    if (!requestedEntry) {
      return notFoundResponse(requestedSlug ?? number);
    }

    if (!allowEmpty && requestedEntry.statsStatus !== 'ready') {
      return statsNotReadyResponse(requestedEntry);
    }

    return makeResponse(200, {
      success: true,
      data: requestedEntry,
    });
  }

  const entries = includeEmpty
    ? POKEMON_STATS_CATALOG
    : POKEMON_STATS_CATALOG.filter((entry) => entry.statsStatus === 'ready');

  if (entries.length === 0) {
    return noPublishedStatsResponse();
  }

  return makeResponse(200, {
    success: true,
    data: groupByVersion ? groupEntriesByVersion(entries) : entries,
    meta: buildMeta(POKEMON_STATS_CATALOG, includeEmpty),
  });
};

export const sendApiResponse = (res, response) => {
  res.statusCode = response.status;

  for (const [headerName, headerValue] of Object.entries(response.headers)) {
    res.setHeader(headerName, headerValue);
  }

  if (response.body === null) {
    res.end();
    return;
  }

  res.end(JSON.stringify(response.body, null, 2));
};

export const handlePokemonStatsRequest = (req, res, context = {}) => {
  const url = new URL(req.url ?? API_BASE_PATH, 'http://localhost');
  const response = resolvePokemonStatsRequest({
    method: req.method ?? 'GET',
    url,
    slug: context.slug ?? null,
  });

  sendApiResponse(res, response);
};
