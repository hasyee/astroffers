import { useCallback } from 'react';
import type { ObjectFilter } from '../calculator/calculator.types';
import { createStateContext, useStateSelector, useStateSetter, useStateValue } from '../provider/state.hooks';
import { defaultFilter } from './filter.utils';

export const FilterContext = createStateContext<ObjectFilter>(defaultFilter);

export const useFilter = () => useStateValue(FilterContext);

export const useFilterSetter = () => useStateSetter(FilterContext);

export const useFilterValue = <K extends keyof ObjectFilter>(key: K) =>
  useStateSelector(FilterContext, filter => filter[key]);

/** Setter of a single filter field */
export const useFilterValueSetter = <K extends keyof ObjectFilter>(key: K) => {
  const setFilter = useFilterSetter();
  return useCallback((value: ObjectFilter[K]) => setFilter(filter => ({ ...filter, [key]: value })), [setFilter, key]);
};

export const useResetFilter = () => {
  const setFilter = useFilterSetter();
  return useCallback(() => setFilter(defaultFilter), [setFilter]);
};
