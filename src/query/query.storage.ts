import { useEffect, useLayoutEffect, useRef } from 'react';
import { MAP_PATH } from '../details/details.utils';
import type { Query } from '../router/router.types';
import { useMatchPath, useQuerySelector, useQuerySetter } from '../router/router.hooks';
import { serializeQuery } from '../router/router.utils';
import { writeStored } from '../storage/storage.utils';
import type { QueryParam } from './query.params';
import { MAP_PARAMS, STORED_PARAMS, withStoredMapParams, withoutMapParams } from './query.utils';

/** The given params of the query, as a query string */
const pickParams = (query: Query, params: QueryParam<unknown>[]) =>
  serializeQuery(Object.fromEntries(params.filter(({ key }) => key in query).map(({ key }) => [key, query[key]])));

/**
 * Stores the params of the query but the date in `localStorage`, to restore them on the next start (`restoreQuery`).
 * The params of the star map apart: entering its route (in the app, by any way, e.g. the forward button) puts the
 * stored ones into the query, their changes on it are stored, and they are left out of the query elsewhere (the query
 * is sticky, leaving the route keeps them). Before the paint, not to show the map without its flips first.
 */
export const useQueryStorage = () => {
  const stored = useQuerySelector(query => pickParams(query, STORED_PARAMS));
  const mapQuery = useQuerySelector(query => pickParams(query, MAP_PARAMS));
  const isMapRoute = !!useMatchPath(MAP_PATH);
  // a start on the route has them restored already (`restoreQuery`)
  const wasMapRouteRef = useRef(isMapRoute);
  const setQuery = useQuerySetter();

  useEffect(() => writeStored('query', stored), [stored]);

  useLayoutEffect(() => {
    const isEntering = isMapRoute && !wasMapRouteRef.current;
    wasMapRouteRef.current = isMapRoute;
    if (isEntering) setQuery(withStoredMapParams);
    else if (isMapRoute) writeStored('mapQuery', mapQuery);
    else if (mapQuery) setQuery(withoutMapParams);
  }, [isMapRoute, mapQuery, setQuery]);
};
