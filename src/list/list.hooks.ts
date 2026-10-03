import { useCallback, useMemo } from 'react';
import { createStateContext, useStateSetter, useStateValue } from '../provider/state.hooks';
import { useResultList } from '../result/result.hooks';
import type { ListSearch, SortBy } from './list.types';
import { defaultSortBy, emptySearch, isSearchEmpty, matchesSearch, sorters } from './list.utils';

export const SortContext = createStateContext<SortBy>(defaultSortBy);

export const useSortBy = () => useStateValue(SortContext);

export const useSortBySetter = () => useStateSetter(SortContext);

export const SearchContext = createStateContext<ListSearch>(emptySearch);

export const useSearch = () => useStateValue(SearchContext);

export const useSearchSetter = () => useStateSetter(SearchContext);

export const useSearchValueSetter = (key: keyof ListSearch) => {
  const setSearch = useSearchSetter();
  return useCallback((value: string) => setSearch(search => ({ ...search, [key]: value })), [setSearch, key]);
};

/** The result list as displayed: searched and sorted */
export const useDisplayedList = () => {
  const list = useResultList();
  const sortBy = useSortBy();
  const search = useSearch();
  return useMemo(
    () => (isSearchEmpty(search) ? list : list.filter(matchesSearch(search))).toSorted(sorters[sortBy]),
    [list, sortBy, search]
  );
};
