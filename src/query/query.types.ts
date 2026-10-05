import type { ObjectFilter, Timestamp } from '../calculator/calculator.types';
import type { ListSearch, SortBy } from '../list/list.types';

/**
 * The state of the main view besides the place, held by the query. All but the date (the night of today on every
 * start) are also stored in `localStorage` to complete the query on start.
 */
export type StoredState = {
  date: Timestamp;
  sortBy: SortBy;
  search: ListSearch;
  hasImages: boolean;
  isCalendarOpen: boolean;
  filter: ObjectFilter;
};
