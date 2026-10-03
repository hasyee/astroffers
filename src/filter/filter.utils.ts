import type { ObjectFilter, SetFilter } from '../calculator/calculator.types';
import { constellations, objectTypes } from '../catalog/catalog.utils';

const selectAll = (keys: Record<string, string>, value = true): SetFilter =>
  Object.fromEntries(Object.keys(keys).map(key => [key, value]));

export const selectAllTypes = (value: boolean) => selectAll(objectTypes, value);

export const selectAllConstellations = (value: boolean) => selectAll(constellations, value);

export const defaultFilter: ObjectFilter = {
  observationTime: 60,
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
