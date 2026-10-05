import { CALENDAR_PARAMS, calendarFromQuery, calendarToQuery, parseStoredCalendar } from '../calendar/calendar.utils';
import type { Coords } from '../location/location.types';
import { DATE_PARAMS, dateFromQuery, dateToQuery, getToday } from '../date/date.utils';
import {
  FILTER_PARAMS,
  defaultFilter,
  filterFromQuery,
  filterToQuery,
  parseStoredFilter
} from '../filter/filter.utils';
import {
  IMAGES_PARAMS,
  SEARCH_PARAMS,
  SORT_PARAMS,
  emptySearch,
  imagesFromQuery,
  imagesToQuery,
  parseStoredImages,
  parseStoredSearch,
  parseStoredSortBy,
  searchFromQuery,
  searchToQuery,
  sortByFromQuery,
  sortByToQuery
} from '../list/list.utils';
import { COORDS_PARAMS, coordsFromQuery, coordsToQuery, parseStoredPlace } from '../location/location.utils';
import type { Query } from '../router/router.types';
import { omitQuery, parseQuery, serializeQuery } from '../router/router.utils';
import type { StoredState } from './query.types';

/** Params of the state of the main view in the query */
export const STATE_PARAMS = [
  ...DATE_PARAMS,
  ...COORDS_PARAMS,
  ...SORT_PARAMS,
  ...SEARCH_PARAMS,
  ...IMAGES_PARAMS,
  ...CALENDAR_PARAMS,
  ...FILTER_PARAMS
];

export const hasQueryState = (query: Query) => STATE_PARAMS.some(key => key in query);

/** The query of the whole state, in the order of the params */
export const stateToQuery = (
  { date, sortBy, search, hasImages, isCalendarOpen, filter }: StoredState,
  coords: Coords
): Query => ({
  ...dateToQuery(date),
  ...coordsToQuery(coords),
  ...sortByToQuery(sortBy),
  ...searchToQuery(search),
  ...imagesToQuery(hasImages),
  ...calendarToQuery(isCalendarOpen),
  ...filterToQuery(filter)
});

export const getStoredState = (): StoredState => ({
  date: getToday(),
  sortBy: parseStoredSortBy(localStorage.getItem('sortBy')),
  search: parseStoredSearch(localStorage.getItem('search')),
  hasImages: parseStoredImages(localStorage.getItem('images')),
  isCalendarOpen: parseStoredCalendar(localStorage.getItem('calendar')),
  filter: parseStoredFilter(localStorage.getItem('filter'))
});

/**
 * Completes the query with the whole state of the app, before the first render: a param missing from the query
 * is taken from the stored state, or from the defaults (the night of today). A query having any of the params
 * (e.g. a shared link) means every object type and constellation by a missing set, no search by a missing search
 * and the compact table and the closed calendar by a missing `img` and `cal`; without them (e.g. the start of the PWA) the stored ones are taken too.
 */
export const initQuery = () => {
  const { pathname, hash } = window.location;

  const query = parseQuery(window.location.search);
  const stored = getStoredState();
  const searchFallback = hasQueryState(query) ? emptySearch : stored.search;
  const imagesFallback = hasQueryState(query) ? false : stored.hasImages;
  const calendarFallback = hasQueryState(query) ? false : stored.isCalendarOpen;
  const filterFallback = hasQueryState(query)
    ? { ...stored.filter, types: defaultFilter.types, constellations: defaultFilter.constellations }
    : stored.filter;

  const search = serializeQuery({
    ...stateToQuery(
      {
        date: dateFromQuery(query, stored.date),
        sortBy: sortByFromQuery(query, stored.sortBy),
        search: searchFromQuery(query, searchFallback),
        hasImages: imagesFromQuery(query, imagesFallback),
        isCalendarOpen: calendarFromQuery(query, calendarFallback),
        filter: filterFromQuery(query, filterFallback)
      },
      coordsFromQuery(query, parseStoredPlace(localStorage.getItem('location')).coords)
    ),
    ...omitQuery(query, STATE_PARAMS)
  });

  if (search !== window.location.search)
    window.history.replaceState(window.history.state, '', pathname + search + hash);
};
