import { useCallback, useMemo } from 'react';
import { defaultFilter } from '../filter/filter.utils';
import { defaultSortBy } from '../list/list.utils';
import { getToday } from '../date/date.utils';
import { createStateContext, useStateSelector, useStateSetter } from '../provider/state.hooks';
import { useQuerySelector, useQuerySetter } from '../router/router.hooks';
import type { Query } from '../router/router.types';
import { parseQuery } from '../router/router.utils';
import type { StoredState } from './query.types';
import { hasQueryState } from './query.utils';

export const StoredStateContext = createStateContext<StoredState>({
  date: getToday(),
  sortBy: defaultSortBy,
  filter: defaultFilter
});

export const useHasQueryState = () => useQuerySelector(hasQueryState);

/**
 * A part of the state: from the query when it holds the state, from the stored state otherwise. Selected in its
 * serialized form, so it keeps its identity while the state moves between them (e.g. no recalculation).
 */
export const useStatePart = <T>(
  fromQuery: (query: Query) => T,
  fromStored: (state: StoredState) => T,
  serialize: (value: T) => string,
  parse: (serialized: string) => T
): T => {
  const queryValue = useQuerySelector(query => (hasQueryState(query) ? serialize(fromQuery(query)) : null));
  const storedValue = useStateSelector(StoredStateContext, state => serialize(fromStored(state)));
  const serialized = queryValue ?? storedValue;
  return useMemo(() => parse(serialized), [parse, serialized]);
};

/** Setter of a part of the state: writes the query when it holds the state, the stored state otherwise */
export const useStatePartSetter = <T>(
  fromQuery: (query: Query) => T,
  toQuery: (query: Query, value: T) => Query,
  fromStored: (state: StoredState) => T,
  toStored: (state: StoredState, value: T) => StoredState
) => {
  const setQuery = useQuerySetter();
  const setStored = useStateSetter(StoredStateContext);
  return useCallback(
    (update: T | ((value: T) => T)) => {
      const resolve = (value: T) => (typeof update === 'function' ? (update as (value: T) => T)(value) : update);
      if (hasQueryState(parseQuery(window.location.search)))
        setQuery(query => toQuery(query, resolve(fromQuery(query))));
      else setStored(state => toStored(state, resolve(fromStored(state))));
    },
    [setQuery, setStored, fromQuery, toQuery, fromStored, toStored]
  );
};
