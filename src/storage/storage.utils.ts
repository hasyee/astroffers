/**
 * The items of `localStorage`: the params of the query stored for the next start, as a query string (see
 * `restoreQuery`), the name of their place (`location/`), only the name, the coordinates are in the query, and the
 * params of the star map, as a query string, for its next opening (`useQueryStorage`). Only these, the items of
 * other apps (e.g. on `localhost`) are left alone.
 */
export type StoredKey = 'query' | 'locationName' | 'mapQuery';

export const readStored = (key: StoredKey): string => localStorage.getItem(key) ?? '';

export const writeStored = (key: StoredKey, value: string) => localStorage.setItem(key, value);
