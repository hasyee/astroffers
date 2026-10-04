import { useEffect } from 'react';
import { useDate } from '../date/date.hooks';
import { useFilter } from '../filter/filter.hooks';
import { useSortBy } from '../list/list.hooks';
import { LocationContext } from '../location/location.hooks';
import { useStateSetter, useStateValue } from '../provider/state.hooks';
import { usePathname, useQuerySetter } from '../router/router.hooks';
import { omitQuery } from '../router/router.utils';
import { StoredStateContext, useHasQueryState } from './query.hooks';
import { STATE_PARAMS, isStatelessRoute, stateToQuery } from './query.utils';

/**
 * Keeps the stored state up to date with the query while the query holds the state, removes the state from the
 * query on the routes without it (`/calendar`, `/help`, `/about`), and restores it from the stored state on the way
 * back. Every hook reads the same values in the meantime, from the query or from the stored state.
 */
export default function QuerySync() {
  const pathname = usePathname();
  const hasQueryState = useHasQueryState();
  const date = useDate();
  const sortBy = useSortBy();
  const filter = useFilter();
  const stored = useStateValue(StoredStateContext);
  const setStored = useStateSetter(StoredStateContext);
  const { coords } = useStateValue(LocationContext);
  const setQuery = useQuerySetter();

  useEffect(() => {
    if (!hasQueryState) return;
    if (stored.date !== date || stored.sortBy !== sortBy || stored.filter !== filter)
      setStored({ date, sortBy, filter });
  }, [hasQueryState, date, sortBy, filter, stored, setStored]);

  useEffect(() => {
    const isStateless = isStatelessRoute(pathname);
    if (isStateless && hasQueryState) setQuery(query => omitQuery(query, STATE_PARAMS));
    if (!isStateless && !hasQueryState) setQuery(query => ({ ...stateToQuery(stored, coords), ...query }));
  }, [pathname, hasQueryState, stored, coords, setQuery]);

  return null;
}
