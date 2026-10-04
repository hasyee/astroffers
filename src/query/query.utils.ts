import type { Coords } from '../location/location.types';
import { DATE_PARAMS, dateFromQuery, dateToQuery, getToday } from '../date/date.utils';
import {
  FILTER_PARAMS,
  defaultFilter,
  filterFromQuery,
  filterToQuery,
  parseStoredFilter
} from '../filter/filter.utils';
import { SORT_PARAMS, parseStoredSortBy, sortByFromQuery, sortByToQuery } from '../list/list.utils';
import { COORDS_PARAMS, coordsFromQuery, coordsToQuery, parseStoredPlace } from '../location/location.utils';
import type { Query } from '../router/router.types';
import { matchPath, omitQuery, parseQuery, serializeQuery } from '../router/router.utils';
import type { StoredState } from './query.types';

/** Params of the state of the main view in the query */
export const STATE_PARAMS = [...DATE_PARAMS, ...COORDS_PARAMS, ...SORT_PARAMS, ...FILTER_PARAMS];

/** Routes without the state of the main view in their query; it is restored from the stored state on the way back */
const STATELESS_ROUTES = ['calendar', 'help', 'about'];

export const isStatelessRoute = (pathname: string) => STATELESS_ROUTES.some(route => matchPath(route, pathname));

export const hasQueryState = (query: Query) => STATE_PARAMS.some(key => key in query);

/** The query of the whole state, in the order of the params */
export const stateToQuery = ({ date, sortBy, filter }: StoredState, coords: Coords): Query => ({
  ...dateToQuery(date),
  ...coordsToQuery(coords),
  ...sortByToQuery(sortBy),
  ...filterToQuery(filter)
});

export const getStoredState = (): StoredState => ({
  date: getToday(),
  sortBy: parseStoredSortBy(localStorage.getItem('sortBy')),
  filter: parseStoredFilter(localStorage.getItem('filter'))
});

/**
 * Completes the query with the whole state of the app, before the first render: a param missing from the query
 * is taken from the stored state, or from the defaults (the night of today). A query having any of the params
 * (e.g. a shared link) means every object type and constellation by a missing set; without them (e.g. the start
 * of the PWA) the stored sets are taken too. The routes without the state are left alone.
 */
export const initQuery = () => {
  const { pathname, hash } = window.location;
  if (isStatelessRoute(pathname)) return;

  const query = parseQuery(window.location.search);
  const stored = getStoredState();
  const filterFallback = hasQueryState(query)
    ? { ...stored.filter, types: defaultFilter.types, constellations: defaultFilter.constellations }
    : stored.filter;

  const search = serializeQuery({
    ...stateToQuery(
      {
        date: dateFromQuery(query, stored.date),
        sortBy: sortByFromQuery(query, stored.sortBy),
        filter: filterFromQuery(query, filterFallback)
      },
      coordsFromQuery(query, parseStoredPlace(localStorage.getItem('location')).coords)
    ),
    ...omitQuery(query, STATE_PARAMS)
  });

  if (search !== window.location.search)
    window.history.replaceState(window.history.state, '', pathname + search + hash);
};
