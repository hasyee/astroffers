import { useCallback, useMemo } from 'react';
import type { ObjectFilter } from '../calculator/calculator.types';
import { SEARCH_PARAMS, SORT_PARAM } from '../list/list.utils';
import { useQueryParams, useQueryParamsSetter } from '../query/query.hooks';
import type { ParamValues } from '../query/query.params';
import { FILTER_PARAMS, toFilter, toFilterParamValues } from './filter.utils';

/** The filter of the query, keeping its identity while other params change (e.g. no recalculation) */
export const useFilter = (): ObjectFilter => {
  const values = useQueryParams(FILTER_PARAMS);
  return useMemo(() => toFilter(values), [values]);
};

/** Setter of the filter, all of its params at once */
export const useFilterSetter = () => {
  const setParams = useQueryParamsSetter(FILTER_PARAMS);
  return useCallback(
    (update: ObjectFilter | ((filter: ObjectFilter) => ObjectFilter)) =>
      setParams(values => toFilterParamValues(typeof update === 'function' ? update(toFilter(values)) : update)),
    [setParams]
  );
};

/** Setter of a single filter field */
export const useFilterValueSetter = <K extends keyof ObjectFilter>(key: K) => {
  const setFilter = useFilterSetter();
  return useCallback((value: ObjectFilter[K]) => setFilter(filter => ({ ...filter, [key]: value })), [setFilter, key]);
};

/** The params reset by the reset button: the filter, the search and the order of the list */
const RESET_PARAMS = { ...FILTER_PARAMS, ...SEARCH_PARAMS, sort: SORT_PARAM };

const RESET_VALUES = Object.fromEntries(
  Object.entries(RESET_PARAMS).map(([name, { defaultValue }]) => [name, defaultValue])
) as ParamValues<typeof RESET_PARAMS>;

/** Resets the filter, the search and the order of the list, at once */
export const useResetFilter = () => {
  const setParams = useQueryParamsSetter(RESET_PARAMS);
  return useCallback(() => setParams(RESET_VALUES), [setParams]);
};
