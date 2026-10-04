import type { ObjectFilter, Timestamp } from '../calculator/calculator.types';
import type { ListSearch, SortBy } from '../list/list.types';

/**
 * The state of the main view kept outside of the query: mirrors the query while it holds the state, and holds it
 * on the routes without it (e.g. `/help`), to restore it on the way back. The filter, the order and the search are
 * stored in
 * `localStorage`, the date only in memory (the night of today on every start); the place is in `location/`.
 */
export type StoredState = { date: Timestamp; sortBy: SortBy; search: ListSearch; filter: ObjectFilter };
