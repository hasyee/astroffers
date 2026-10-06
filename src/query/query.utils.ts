import { CALENDAR_PARAMS, calendarFromQuery, calendarToQuery, parseStoredCalendar } from '../calendar/calendar.utils';
import type { Coords } from '../location/location.types';
import { RED_LIGHT_PARAMS, parseStoredRedLight, redLightFromQuery, redLightToQuery } from '../redlight/redlight.utils';
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
  defaultSortBy,
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
  ...RED_LIGHT_PARAMS,
  ...FILTER_PARAMS
];

export const hasQueryState = (query: Query) => STATE_PARAMS.some(key => key in query);

/** The query of the state, in the order of the params: the date, the place and the others differing from their defaults */
export const stateToQuery = (
  { date, sortBy, search, hasImages, isCalendarOpen, isRedLight, filter }: StoredState,
  coords: Coords
): Query => ({
  ...dateToQuery(date),
  ...coordsToQuery(coords),
  ...sortByToQuery(sortBy),
  ...searchToQuery(search),
  ...imagesToQuery(hasImages),
  ...calendarToQuery(isCalendarOpen),
  ...redLightToQuery(isRedLight),
  ...filterToQuery(filter)
});

export const getStoredState = (): StoredState => ({
  date: getToday(),
  sortBy: parseStoredSortBy(localStorage.getItem('sortBy')),
  search: parseStoredSearch(localStorage.getItem('search')),
  hasImages: parseStoredImages(localStorage.getItem('images')),
  isCalendarOpen: parseStoredCalendar(localStorage.getItem('calendar')),
  isRedLight: parseStoredRedLight(localStorage.getItem('redLight')),
  filter: parseStoredFilter(localStorage.getItem('filter'))
});

/**
 * Completes the query with the state of the app, before the first render: the date and the place always, the others
 * when they differ from their defaults. A query having any of the params (e.g. a shared link, which has the date and
 * the place) means the default by a missing one; without them (e.g. the start of the PWA) the stored state is taken,
 * the date of today and the stored place.
 */
export const initQuery = () => {
  const { pathname, hash } = window.location;

  const query = parseQuery(window.location.search);
  const stored = getStoredState();
  const isShared = hasQueryState(query);
  const sortByFallback = isShared ? defaultSortBy : stored.sortBy;
  const searchFallback = isShared ? emptySearch : stored.search;
  const imagesFallback = isShared ? true : stored.hasImages;
  const calendarFallback = isShared ? false : stored.isCalendarOpen;
  const redLightFallback = isShared ? false : stored.isRedLight;
  const filterFallback = isShared ? defaultFilter : stored.filter;

  const search = serializeQuery({
    ...stateToQuery(
      {
        date: dateFromQuery(query, stored.date),
        sortBy: sortByFromQuery(query, sortByFallback),
        search: searchFromQuery(query, searchFallback),
        hasImages: imagesFromQuery(query, imagesFallback),
        isCalendarOpen: calendarFromQuery(query, calendarFallback),
        isRedLight: redLightFromQuery(query, redLightFallback),
        filter: filterFromQuery(query, filterFallback)
      },
      coordsFromQuery(query, parseStoredPlace(localStorage.getItem('location')).coords)
    ),
    ...omitQuery(query, STATE_PARAMS)
  });

  if (search !== window.location.search)
    window.history.replaceState(window.history.state, '', pathname + search + hash);
};
