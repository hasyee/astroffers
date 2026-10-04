import { useCallback, useMemo, useRef, useState } from 'react';
import { useResultList } from '../result/result.hooks';
import { useStatePart, useStatePartSetter } from '../query/query.hooks';
import type { StoredState } from '../query/query.types';
import type { Query } from '../router/router.types';
import { omitQuery, parseQuery, serializeQuery } from '../router/router.utils';
import type { ListSearch, SortBy } from './list.types';
import {
  defaultSortBy,
  emptySearch,
  isSearchEmpty,
  matchesSearch,
  searchFromQuery,
  searchToQuery,
  SEARCH_PARAMS,
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

const getSearch = (query: Query) => searchFromQuery(query, emptySearch);
const getStoredSearch = (state: StoredState) => state.search;
const serializeSearch = (search: ListSearch) => serializeQuery(searchToQuery(search));
const parseSearch = (serialized: string) => getSearch(parseQuery(serialized));
// an emptied term is left out, so the search params are replaced
const setQuerySearch = (query: Query, search: ListSearch): Query => ({
  ...omitQuery(query, SEARCH_PARAMS),
  ...searchToQuery(search)
});
const setStoredSearch = (state: StoredState, search: ListSearch): StoredState => ({ ...state, search });

/** Search terms of the list */
export const useSearch = () => useStatePart(getSearch, getStoredSearch, serializeSearch, parseSearch);

export const useSearchSetter = () => useStatePartSetter(getSearch, setQuerySearch, getStoredSearch, setStoredSearch);

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
