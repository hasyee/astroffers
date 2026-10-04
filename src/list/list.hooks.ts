import { useCallback, useMemo, useRef, useState } from 'react';
import { createStateContext, useStateSetter, useStateValue } from '../provider/state.hooks';
import { useResultList } from '../result/result.hooks';
import { useStatePart, useStatePartSetter } from '../query/query.hooks';
import type { StoredState } from '../query/query.types';
import type { Query } from '../router/router.types';
import type { ListSearch, SortBy } from './list.types';
import {
  defaultSortBy,
  emptySearch,
  isSearchEmpty,
  matchesSearch,
  sortByFromQuery,
  sortByToQuery,
  sorters
} from './list.utils';

const getSortBy = (query: Query) => sortByFromQuery(query, defaultSortBy);
const getStoredSortBy = (state: StoredState) => state.sortBy;
const keepSortBy = (sortBy: SortBy) => sortBy;
const parseSortBy = (serialized: string) => serialized as SortBy;
const setQuerySortBy = (query: Query, sortBy: SortBy): Query => ({ ...query, ...sortByToQuery(sortBy) });
const setStoredSortBy = (state: StoredState, sortBy: SortBy): StoredState => ({ ...state, sortBy });

/** Order of the list */
export const useSortBy = () => useStatePart(getSortBy, getStoredSortBy, keepSortBy, parseSortBy);

export const useSortBySetter = () => useStatePartSetter(getSortBy, setQuerySortBy, getStoredSortBy, setStoredSortBy);

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

const PAGE_SIZE = 100;

/**
 * Renders a long list page by page: returns the visible part, and a ref for a sentinel element
 * after it, which loads the next page when scrolled into view. Starts over whenever the list changes.
 */
export const useIncrementalList = <T>(list: T[]) => {
  const [state, setState] = useState({ list, count: PAGE_SIZE });
  const count = state.list === list ? state.count : PAGE_SIZE;
  if (state.list !== list) setState({ list, count: PAGE_SIZE });

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useCallback(
    (element: HTMLElement | null) => {
      observer.current?.disconnect();
      if (!element) return;
      observer.current = new IntersectionObserver(entries => {
        if (entries.some(entry => entry.isIntersecting))
          setState(state => (state.list === list ? { list, count: state.count + PAGE_SIZE } : state));
      });
      observer.current.observe(element);
    },
    [list]
  );

  return { visibleList: list.slice(0, count), hasMore: count < list.length, sentinelRef };
};
