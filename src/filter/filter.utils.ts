import type { ObjectFilter, SetFilter } from '../calculator/calculator.types';
import { constellations, objectTypes } from '../catalog/catalog.utils';
import type { Query } from '../router/router.types';

const selectAll = (keys: Record<string, string>, value = true): SetFilter =>
  Object.fromEntries(Object.keys(keys).map(key => [key, value]));

export const selectAllTypes = (value: boolean) => selectAll(objectTypes, value);

export const selectAllConstellations = (value: boolean) => selectAll(constellations, value);

export const defaultFilter: ObjectFilter = {
  observationTime: 30,
  twilight: -18,
  altitude: 20,
  moonless: true,
  brightnessFilter: 'magnitude',
  magnitude: 10,
  surfaceBrightness: 14,
  types: selectAllTypes(true),
  constellations: selectAllConstellations(true)
};

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const parseNumber = (value: unknown, fallback: number) => (isNumber(value) ? value : fallback);

/** Keeps the known keys only, defaulting the missing ones to selected */
const parseSetFilter = (value: unknown, defaults: SetFilter): SetFilter =>
  Object.fromEntries(
    Object.keys(defaults).map(key => [
      key,
      typeof (value as SetFilter | undefined)?.[key] === 'boolean' ? (value as SetFilter)[key] : defaults[key]
    ])
  );

/** Restores the filter from its stored JSON; falls back to the defaults for anything missing or malformed. */
export const parseStoredFilter = (json: string | null): ObjectFilter => {
  if (!json) return defaultFilter;
  try {
    const stored = JSON.parse(json);
    return {
      observationTime: parseNumber(stored.observationTime, defaultFilter.observationTime),
      twilight: parseNumber(stored.twilight, defaultFilter.twilight),
      altitude: parseNumber(stored.altitude, defaultFilter.altitude),
      moonless: typeof stored.moonless === 'boolean' ? stored.moonless : defaultFilter.moonless,
      brightnessFilter: stored.brightnessFilter === 'surfaceBrightness' ? 'surfaceBrightness' : 'magnitude',
      magnitude: parseNumber(stored.magnitude, defaultFilter.magnitude),
      surfaceBrightness: parseNumber(stored.surfaceBrightness, defaultFilter.surfaceBrightness),
      types: parseSetFilter(stored.types, defaultFilter.types),
      constellations: parseSetFilter(stored.constellations, defaultFilter.constellations)
    };
  } catch (error) {
    console.error(error);
    return defaultFilter;
  }
};

export const countSelected = (setFilter: SetFilter) => Object.values(setFilter).filter(selected => selected).length;

/**
 * Query params of the filter. A set (object types, constellations) is left out when everything is selected,
 * otherwise it lists the selected keys, or the excluded ones (`ex...`) when more are selected than not.
 */
export const FILTER_PARAMS = [
  'alt',
  'bf',
  'mag',
  'sb',
  'tw',
  'ot',
  'ml',
  'const',
  'exConst',
  'types',
  'exTypes'
] as const;

const parseNumberParam = (value: string | undefined, min: number, max: number, fallback: number) => {
  const number = Number(value);
  return value?.trim() && Number.isFinite(number) && number >= min && number <= max ? number : fallback;
};

const parseSetParams = (included: string | undefined, excluded: string | undefined, fallback: SetFilter): SetFilter => {
  const toKeys = (value: string) => value.split(',').filter(key => Object.hasOwn(fallback, key));
  if (included !== undefined) {
    const keys = toKeys(included);
    return Object.fromEntries(Object.keys(fallback).map(key => [key, keys.includes(key)]));
  }
  if (excluded !== undefined) {
    const keys = toKeys(excluded);
    return Object.fromEntries(Object.keys(fallback).map(key => [key, !keys.includes(key)]));
  }
  return fallback;
};

const setToParams = (setFilter: SetFilter, includedParam: string, excludedParam: string): Query => {
  const selected = Object.keys(setFilter).filter(key => setFilter[key]);
  const excluded = Object.keys(setFilter).filter(key => !setFilter[key]);
  if (excluded.length === 0) return {};
  return selected.length > excluded.length
    ? { [excludedParam]: excluded.join(',') }
    : { [includedParam]: selected.join(',') };
};

/** The filter from the query; a missing or invalid param is taken from the fallback */
export const filterFromQuery = (query: Query, fallback: ObjectFilter): ObjectFilter => ({
  altitude: parseNumberParam(query.alt, -90, 90, fallback.altitude),
  brightnessFilter: query.bf === 'magnitude' || query.bf === 'surfaceBrightness' ? query.bf : fallback.brightnessFilter,
  magnitude: parseNumberParam(query.mag, -30, 30, fallback.magnitude),
  surfaceBrightness: parseNumberParam(query.sb, -30, 30, fallback.surfaceBrightness),
  twilight: parseNumberParam(query.tw, -90, 0, fallback.twilight),
  observationTime: parseNumberParam(query.ot, 0, 1440, fallback.observationTime),
  moonless: query.ml === '1' ? true : query.ml === '0' ? false : fallback.moonless,
  constellations: parseSetParams(query.const, query.exConst, fallback.constellations),
  types: parseSetParams(query.types, query.exTypes, fallback.types)
});

export const filterToQuery = (filter: ObjectFilter): Query => ({
  alt: String(filter.altitude),
  bf: filter.brightnessFilter,
  mag: String(filter.magnitude),
  sb: String(filter.surfaceBrightness),
  tw: String(filter.twilight),
  ot: String(filter.observationTime),
  ml: filter.moonless ? '1' : '0',
  ...setToParams(filter.constellations, 'const', 'exConst'),
  ...setToParams(filter.types, 'types', 'exTypes')
});
