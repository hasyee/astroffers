import { useCallback, useMemo } from 'react';
import { useQuerySelector, useQuerySetter } from '../router/router.hooks';
import type { Query } from '../router/router.types';

/**
 * A part of the state from the query. Selected in its serialized form, as a selector must return a stable value,
 * so it keeps its identity while other params change (e.g. no recalculation).
 */
export const useQueryState = <T>(
  fromQuery: (query: Query) => T,
  serialize: (value: T) => string,
  parse: (serialized: string) => T
): T => {
  const serialized = useQuerySelector(query => serialize(fromQuery(query)));
  return useMemo(() => parse(serialized), [parse, serialized]);
};

/** Setter of a part of the state in the query (`replaceState`, no history entry) */
export const useQueryStateSetter = <T>(fromQuery: (query: Query) => T, toQuery: (query: Query, value: T) => Query) => {
  const setQuery = useQuerySetter();
  return useCallback(
    (update: T | ((value: T) => T)) =>
      setQuery(query =>
        toQuery(query, typeof update === 'function' ? (update as (value: T) => T)(fromQuery(query)) : update)
      ),
    [setQuery, fromQuery, toQuery]
  );
};
