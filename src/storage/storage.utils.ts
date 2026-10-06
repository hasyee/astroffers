import type { ObjectFilter } from '../calculator/calculator.types';
import { parseStoredCalendar } from '../calendar/calendar.utils';
import { parseStoredFilter } from '../filter/filter.utils';
import type { ListSearch, SortBy } from '../list/list.types';
import { parseStoredImages, parseStoredSearch, parseStoredSortBy } from '../list/list.utils';
import type { Place } from '../location/location.types';
import { parseStoredPlace } from '../location/location.utils';
import { parseStoredRedLight } from '../redlight/redlight.utils';

/** The values stored in `localStorage`, by their keys */
type StoredValues = {
  sortBy: SortBy;
  search: ListSearch;
  images: boolean;
  calendar: boolean;
  redLight: boolean;
  filter: ObjectFilter;
  location: Place;
};

export type StoredKey = keyof StoredValues;

/** Reads a stored value, falling back to its default for a missing or unknown one; writes it back */
type StoredItem<T> = { parse: (value: string | null) => T; serialize: (value: T) => string };

const STORED_ITEMS: { [K in StoredKey]: StoredItem<StoredValues[K]> } = {
  sortBy: { parse: parseStoredSortBy, serialize: sortBy => sortBy },
  search: { parse: parseStoredSearch, serialize: JSON.stringify },
  images: { parse: parseStoredImages, serialize: String },
  calendar: { parse: parseStoredCalendar, serialize: String },
  redLight: { parse: parseStoredRedLight, serialize: String },
  filter: { parse: parseStoredFilter, serialize: JSON.stringify },
  location: { parse: parseStoredPlace, serialize: JSON.stringify }
};

const isStoredKey = (key: string): key is StoredKey => Object.hasOwn(STORED_ITEMS, key);

export const readStored = <K extends StoredKey>(key: K): StoredValues[K] =>
  STORED_ITEMS[key].parse(localStorage.getItem(key));

export const writeStored = <K extends StoredKey>(key: K, value: StoredValues[K]) =>
  localStorage.setItem(key, STORED_ITEMS[key].serialize(value));

/** A stored value as the app writes what it reads from it */
const cleanValue = <K extends StoredKey>(key: K, value: string | null) =>
  STORED_ITEMS[key].serialize(STORED_ITEMS[key].parse(value));

/**
 * Drops the items unknown to the app (e.g. of an old version), and rewrites the known ones as the app reads them:
 * an unknown value is replaced by its default, unknown fields are dropped, the ones of an old version are migrated
 * (e.g. the `moonless` switch of the filter)
 */
export const cleanStorage = () => {
  const keys = Array.from({ length: localStorage.length }, (_, index) => localStorage.key(index)).filter(
    key => key !== null
  );
  for (const key of keys) {
    if (!isStoredKey(key)) {
      localStorage.removeItem(key);
      continue;
    }
    const value = localStorage.getItem(key);
    const cleaned = cleanValue(key, value);
    if (cleaned !== value) localStorage.setItem(key, cleaned);
  }
};
