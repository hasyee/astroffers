import { CALENDAR_PARAM } from '../calendar/calendar.utils';
import { DATE_PARAM, getToday } from '../date/date.utils';
import { FILTER_PARAMS } from '../filter/filter.utils';
import { IMAGES_PARAM, SEARCH_PARAMS, SORT_PARAM } from '../list/list.utils';
import { LAT_PARAM, LNG_PARAM, defaultPlace } from '../location/location.utils';
import { RED_LIGHT_PARAM } from '../redlight/redlight.utils';
import type { Query } from '../router/router.types';
import { parseQuery, serializeQuery } from '../router/router.utils';
import { readStored, writeStored } from '../storage/storage.utils';
import { type QueryParam, hasKnownParam, paramToQuery, readParam } from './query.params';

/** Params of the state of the main view in the query, in their order */
export const STATE_PARAMS: QueryParam<unknown>[] = [
  DATE_PARAM,
  LNG_PARAM,
  LAT_PARAM,
  SORT_PARAM,
  ...Object.values(SEARCH_PARAMS),
  IMAGES_PARAM,
  CALENDAR_PARAM,
  RED_LIGHT_PARAM,
  ...Object.values(FILTER_PARAMS)
];

/** The ones stored for the next start (`useQueryStorage`): all but the date, the night of today on every start */
export const STORED_PARAMS = STATE_PARAMS.filter(param => param !== DATE_PARAM);

const hasCoords = (query: Query) => readParam(query, LNG_PARAM) !== null && readParam(query, LAT_PARAM) !== null;

const isSameCoords = (a: Query, b: Query) =>
  readParam(a, LNG_PARAM) === readParam(b, LNG_PARAM) && readParam(a, LAT_PARAM) === readParam(b, LAT_PARAM);

const DEFAULT_COORDS: Query = {
  ...paramToQuery(LNG_PARAM, defaultPlace.coords.lng),
  ...paramToQuery(LAT_PARAM, defaultPlace.coords.lat)
};

/**
 * Completes the query with the state of the app, before the first render (the hooks of the state read the query
 * only). The params unknown to the app, or having an unknown value, are dropped. A link (having any known param)
 * has its own state, a missing param is its default; a bare start (e.g. of the PWA) takes the stored params. The date
 * (today without one) and the place (the stored one without one) are always in the query, the others only when they
 * differ from their defaults. The stored name of the place is cleared for a link to another place.
 */
export const restoreQuery = () => {
  const { pathname, search, hash } = window.location;

  // unknown params and values read as missing, and are not written back
  const link = parseQuery(search);
  const stored = parseQuery(readStored('query'));
  const state = hasKnownParam(link, STATE_PARAMS) ? link : stored;
  const coords = hasCoords(state) ? state : hasCoords(stored) ? stored : DEFAULT_COORDS;
  if (!isSameCoords(coords, stored)) writeStored('locationName', '');

  const read = (param: QueryParam<unknown>) =>
    param === DATE_PARAM
      ? (readParam(state, DATE_PARAM) ?? new Date(getToday()))
      : readParam(param === LNG_PARAM || param === LAT_PARAM ? coords : state, param);
  const restored = serializeQuery(Object.assign({}, ...STATE_PARAMS.map(param => paramToQuery(param, read(param)))));

  if (restored !== search) window.history.replaceState(window.history.state, '', pathname + restored + hash);
};
