import type { BrightnessType, ObjectFilter, ObservationWindow, SetFilter } from '../calculator/calculator.types';
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
  observationWindow: 'astroNight',
  brightnessLimitType: 'magnitude',
  magnitude: 10,
  surfaceBrightness: 14,
  types: selectAllTypes(true),
  constellations: selectAllConstellations(true)
};

const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const parseNumber = (value: unknown, fallback: number) => (isNumber(value) ? value : fallback);

const OBSERVATION_WINDOWS: ObservationWindow[] = ['moonlessNight', 'astroNight', 'night'];

const isObservationWindow = (value: unknown): value is ObservationWindow =>
  OBSERVATION_WINDOWS.includes(value as ObservationWindow);

/** The observation window of a filter stored before it, by its `moonless` switch */
const parseStoredObservationWindow = ({ observationWindow, moonless }: Record<string, unknown>): ObservationWindow =>
  isObservationWindow(observationWindow)
    ? observationWindow
    : moonless === true
      ? 'moonlessNight'
      : defaultFilter.observationWindow;

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
      observationWindow: parseStoredObservationWindow(stored),
      // `brightnessFilter` before its renaming
      brightnessLimitType:
        (stored.brightnessLimitType ?? stored.brightnessFilter) === 'surfaceBrightness'
          ? 'surfaceBrightness'
          : 'magnitude',
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
 * Query params of the filter, each left out at its default value. A set (object types, constellations) is left out
 * when everything is selected, otherwise it lists the selected keys, or the excluded ones (`ex...`) when more are
 * selected than not.
 */
export const FILTER_PARAMS = [
  'alt',
  'blt',
  'mag',
  'sb',
  'tw',
  'ot',
  'ow',
  // read only, from old links: the switch of the moonless night before the observation window, and `blt` before its
  // renaming
  'ml',
  'bf',
  'const',
  'exConst',
  'types',
  'exTypes'
] as const;

const parseNumberParam = (value: string | undefined, min: number, max: number, fallback: number) => {
  const number = Number(value);
  return value?.trim() && Number.isFinite(number) && number >= min && number <= max ? number : fallback;
};

/** The params of the observation window: `man`, `an`, `n` */
const observationWindowParams: Record<ObservationWindow, string> = {
  moonlessNight: 'man',
  astroNight: 'an',
  night: 'n'
};

const parseObservationWindowParam = (query: Query, fallback: ObservationWindow): ObservationWindow => {
  const fromParam = OBSERVATION_WINDOWS.find(key => observationWindowParams[key] === query.ow);
  return fromParam ?? (query.ml === '1' ? 'moonlessNight' : query.ml === '0' ? 'astroNight' : fallback);
};

/** The params of the brightness limit type: `mag`, `sb` (`bf` before took the keys themselves) */
const brightnessLimitTypeParams: Record<BrightnessType, string> = { magnitude: 'mag', surfaceBrightness: 'sb' };

const parseBrightnessLimitTypeParam = (query: Query, fallback: BrightnessType): BrightnessType => {
  const fromParam = (Object.keys(brightnessLimitTypeParams) as BrightnessType[]).find(
    key => brightnessLimitTypeParams[key] === query.blt
  );
  return fromParam ?? (query.bf === 'magnitude' || query.bf === 'surfaceBrightness' ? query.bf : fallback);
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
  brightnessLimitType: parseBrightnessLimitTypeParam(query, fallback.brightnessLimitType),
  magnitude: parseNumberParam(query.mag, -30, 30, fallback.magnitude),
  surfaceBrightness: parseNumberParam(query.sb, -30, 30, fallback.surfaceBrightness),
  twilight: parseNumberParam(query.tw, -90, 0, fallback.twilight),
  observationTime: parseNumberParam(query.ot, 0, 1440, fallback.observationTime),
  observationWindow: parseObservationWindowParam(query, fallback.observationWindow),
  constellations: parseSetParams(query.const, query.exConst, fallback.constellations),
  types: parseSetParams(query.types, query.exTypes, fallback.types)
});

/** The param of a field of the filter, or none at its default value */
const fieldToParam = <K extends keyof ObjectFilter>(
  filter: ObjectFilter,
  key: K,
  param: string,
  serialize: (value: ObjectFilter[K]) => string = String
): Query => (filter[key] === defaultFilter[key] ? {} : { [param]: serialize(filter[key]) });

export const filterToQuery = (filter: ObjectFilter): Query => ({
  ...fieldToParam(filter, 'altitude', 'alt'),
  ...fieldToParam(filter, 'brightnessLimitType', 'blt', key => brightnessLimitTypeParams[key]),
  ...fieldToParam(filter, 'magnitude', 'mag'),
  ...fieldToParam(filter, 'surfaceBrightness', 'sb'),
  ...fieldToParam(filter, 'twilight', 'tw'),
  ...fieldToParam(filter, 'observationTime', 'ot'),
  ...fieldToParam(filter, 'observationWindow', 'ow', key => observationWindowParams[key]),
  ...setToParams(filter.constellations, 'const', 'exConst'),
  ...setToParams(filter.types, 'types', 'exTypes')
});
