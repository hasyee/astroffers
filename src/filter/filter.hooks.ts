import { useCallback } from 'react';
import type { ObjectFilter } from '../calculator/calculator.types';
import { useStatePart, useStatePartSetter } from '../query/query.hooks';
import type { StoredState } from '../query/query.types';
import type { Query } from '../router/router.types';
import { omitQuery, parseQuery, serializeQuery } from '../router/router.utils';
import { FILTER_PARAMS, defaultFilter, filterFromQuery, filterToQuery } from './filter.utils';

const getFilter = (query: Query) => filterFromQuery(query, defaultFilter);
const getStoredFilter = (state: StoredState) => state.filter;
const serializeFilter = (filter: ObjectFilter) => serializeQuery(filterToQuery(filter));
const parseFilter = (serialized: string) => getFilter(parseQuery(serialized));
// a set param may be left out or renamed (e.g. `const` -> `exConst`), so the filter params are replaced
const setQueryFilter = (query: Query, filter: ObjectFilter): Query => ({
  ...omitQuery(query, FILTER_PARAMS),
  ...filterToQuery(filter)
});
const setStoredFilter = (state: StoredState, filter: ObjectFilter): StoredState => ({ ...state, filter });

export const useFilter = () => useStatePart(getFilter, getStoredFilter, serializeFilter, parseFilter);

export const useFilterSetter = () => useStatePartSetter(getFilter, setQueryFilter, getStoredFilter, setStoredFilter);

/** Setter of a single filter field */
export const useFilterValueSetter = <K extends keyof ObjectFilter>(key: K) => {
  const setFilter = useFilterSetter();
  return useCallback((value: ObjectFilter[K]) => setFilter(filter => ({ ...filter, [key]: value })), [setFilter, key]);
};

export const useResetFilter = () => {
  const setFilter = useFilterSetter();
  return useCallback(() => setFilter(defaultFilter), [setFilter]);
};
