/**
 * The items of `localStorage`: the params of the query stored for the next start, as a query string (see
 * `restoreQuery`), and the name of their place (`location/`), only the name, the coordinates are in the query. Only
 * these, the items of other apps (e.g. on `localhost`) are left alone.
 */
export type StoredKey = 'query' | 'locationName';

export const readStored = (key: StoredKey): string => localStorage.getItem(key) ?? '';

export const writeStored = (key: StoredKey, value: string) => localStorage.setItem(key, value);
