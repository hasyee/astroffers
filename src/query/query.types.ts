import type { ObjectFilter, Timestamp } from '../calculator/calculator.types';
import type { ListSearch, SortBy } from '../list/list.types';

/**
 * The state of the main view besides the place, held by the query. The filter, the order, the search and the images
 * of the table are also stored in `localStorage` to complete the query on start, the date is not (the night of today
 * on every start).
 */
export type StoredState = {
  date: Timestamp;
  sortBy: SortBy;
  search: ListSearch;
  hasImages: boolean;
  filter: ObjectFilter;
};
