const ENTRY_FIELD_ORDER = [
  'number',
  'tagId',
  'versionIdentifier',
  'versionLabel',
  'pokemonId',
  'name',
  'form',
  'type',
  'star',
  'attack',
  'attackType',
  'pokeEne',
  'marks',
  'rarity',
  'traits',
  'move',
  'source',
  'isPlaceholder',
  'lastUpdated',
  'notes',
  'stats',
];

const MOVE_FIELD_ORDER = ['name', 'type', 'category'];
const STATS_FIELD_ORDER = [
  'hp',
  'attack',
  'defense',
  'specialAttack',
  'specialDefense',
  'speed',
];

const normalizeString = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const normalized = String(value).trim();
  return normalized ? normalized : null;
};

const normalizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeString(item))
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => normalizeString(item))
      .filter(Boolean);
  }

  return [];
};

const formatScalar = (value) => {
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return JSON.stringify(value);
};

const indent = (level) => '  '.repeat(level);

const formatArray = (value, level) => {
  if (value.length === 0) {
    return '[]';
  }

  if (value.every((item) => typeof item === 'string')) {
    const inline = `[${value.map((item) => JSON.stringify(item)).join(', ')}]`;
    if (inline.length <= 80) {
      return inline;
    }
  }

  return [
    '[',
    ...value.map((item) => `${indent(level + 1)}${formatValue(item, level + 1)},`),
    `${indent(level)}]`,
  ].join('\n');
};

const formatObject = (value, level, fieldOrder = null) => {
  const keys = fieldOrder
    ? fieldOrder.filter((key) => key in value)
    : Object.keys(value);

  if (keys.length === 0) {
    return '{}';
  }

  return [
    '{',
    ...keys.map((key) => `${indent(level + 1)}${key}: ${formatValue(value[key], level + 1)},`),
    `${indent(level)}}`,
  ].join('\n');
};

const formatValue = (value, level) => {
  if (Array.isArray(value)) {
    return formatArray(value, level);
  }

  if (value && typeof value === 'object') {
    return formatObject(value, level);
  }

  return formatScalar(value);
};

export const normalizeEditableMezatagEntry = (entry) => {
  const moveInput = entry?.move ?? null;
  const statsInput = entry?.stats ?? null;

  return {
    number: normalizeString(entry?.number),
    tagId: normalizeString(entry?.tagId) ?? normalizeString(entry?.number),
    versionIdentifier: normalizeString(entry?.versionIdentifier),
    versionLabel: normalizeString(entry?.versionLabel),
    pokemonId: normalizeNumber(entry?.pokemonId),
    name: normalizeString(entry?.name),
    form: normalizeString(entry?.form) ?? 'Normal',
    type: normalizeString(entry?.type),
    star: normalizeNumber(entry?.star),
    attack: normalizeString(entry?.attack),
    attackType: normalizeString(entry?.attackType),
    pokeEne: normalizeNumber(entry?.pokeEne),
    marks: normalizeStringArray(entry?.marks),
    rarity: normalizeString(entry?.rarity),
    traits: normalizeStringArray(entry?.traits),
    move: moveInput
      ? {
          name: normalizeString(moveInput.name),
          type: normalizeString(moveInput.type),
          category: normalizeString(moveInput.category),
        }
      : null,
    source: normalizeString(entry?.source) ?? 'pokeapi-base-stats',
    isPlaceholder: Boolean(entry?.isPlaceholder),
    lastUpdated: normalizeString(entry?.lastUpdated),
    notes: normalizeString(entry?.notes),
    stats: {
      hp: normalizeNumber(statsInput?.hp),
      attack: normalizeNumber(statsInput?.attack),
      defense: normalizeNumber(statsInput?.defense),
      specialAttack: normalizeNumber(statsInput?.specialAttack),
      specialDefense: normalizeNumber(statsInput?.specialDefense),
      speed: normalizeNumber(statsInput?.speed),
    },
  };
};

export const sortEditableMezatagEntries = (entries) =>
  [...entries].sort((left, right) => {
    const getVersionRank = (identifier) => {
      if (identifier === 'Special') return [99, 99];

      const match = String(identifier ?? '').match(/^(stardust|galaxy)_v(\d+)$/i);
      if (!match) return [50, 50];

      const familyRank = match[1].toLowerCase() === 'stardust' ? 1 : 2;
      return [familyRank, Number(match[2])];
    };

    const [leftFamilyRank, leftVersionRank] = getVersionRank(left.versionIdentifier);
    const [rightFamilyRank, rightVersionRank] = getVersionRank(right.versionIdentifier);
    const versionCompare =
      leftFamilyRank - rightFamilyRank || leftVersionRank - rightVersionRank;

    if (versionCompare !== 0) {
      return versionCompare;
    }

    return String(left.number ?? '').localeCompare(String(right.number ?? ''), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
  });

export const serializeMezatagStats = (entries) => {
  const normalizedEntries = sortEditableMezatagEntries(entries).map((entry) =>
    normalizeEditableMezatagEntry(entry),
  );

  const body = normalizedEntries
    .map((entry) =>
      formatObject(
        {
          ...entry,
          move: entry.move
            ? Object.fromEntries(MOVE_FIELD_ORDER.map((key) => [key, entry.move[key] ?? null]))
            : null,
          stats: Object.fromEntries(STATS_FIELD_ORDER.map((key) => [key, entry.stats[key] ?? null])),
        },
        0,
        ENTRY_FIELD_ORDER,
      ),
    )
    .map((chunk) => `  ${chunk.replace(/\n/g, '\n  ')}`)
    .join(',\n');

  return `export const MEZATAG_POKEMON_STATS = [\n${body}\n];\n`;
};

export const parseImportedMezatagStats = (rawSource) => {
  const source = String(rawSource ?? '').trim();

  if (!source) {
    throw new Error('The imported file is empty.');
  }

  try {
    const parsedJson = JSON.parse(source);
    if (!Array.isArray(parsedJson)) {
      throw new Error('JSON import must be an array of Mezatag entries.');
    }

    return sortEditableMezatagEntries(parsedJson.map((entry) => normalizeEditableMezatagEntry(entry)));
  } catch {
    const cleanedSource = source
      .replace(/^export\s+const\s+MEZATAG_POKEMON_STATS\s*=\s*/m, '')
      .replace(/;\s*$/, '');

    try {
      const parsedJs = Function(`"use strict"; return (${cleanedSource});`)();
      if (!Array.isArray(parsedJs)) {
        throw new Error('JS import must evaluate to an array of Mezatag entries.');
      }

      return sortEditableMezatagEntries(parsedJs.map((entry) => normalizeEditableMezatagEntry(entry)));
    } catch (error) {
      throw new Error(error?.message || 'Failed to parse imported JS/JSON stats file.');
    }
  }
};
