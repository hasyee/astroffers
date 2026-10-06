import { useCallback, useMemo, useRef, useState } from 'react';
import { useResultList } from '../result/result.hooks';
import { useStatePart, useStatePartSetter } from '../query/query.hooks';
import type { Query } from '../router/router.types';
import { omitQuery, parseQuery, serializeQuery } from '../router/router.utils';
import type { ListSearch, SortBy } from './list.types';
import {
  defaultSortBy,
  emptySearch,
  IMAGES_PARAMS,
  imagesFromQuery,
  imagesToQuery,
  isSearchEmpty,
  matchesSearch,
  searchFromQuery,
  searchToQuery,
  SEARCH_PARAMS,
  sortByFromQuery,
  sortByToQuery,
  SORT_PARAMS,
  sorters
} from './list.utils';

const getSortBy = (query: Query) => sortByFromQuery(query, defaultSortBy);
const keepSortBy = (sortBy: SortBy) => sortBy;
const parseSortBy = (serialized: string) => serialized as SortBy;
// the default order is left out, so the param is replaced
const setQuerySortBy = (query: Query, sortBy: SortBy): Query => ({
  ...omitQuery(query, SORT_PARAMS),
  ...sortByToQuery(sortBy)
});

/** Order of the list */
export const useSortBy = () => useStatePart(getSortBy, keepSortBy, parseSortBy);

export const useSortBySetter = () => useStatePartSetter(getSortBy, setQuerySortBy);

const getSearch = (query: Query) => searchFromQuery(query, emptySearch);
const serializeSearch = (search: ListSearch) => serializeQuery(searchToQuery(search));
const parseSearch = (serialized: string) => getSearch(parseQuery(serialized));
// an emptied term is left out, so the search params are replaced
const setQuerySearch = (query: Query, search: ListSearch): Query => ({
  ...omitQuery(query, SEARCH_PARAMS),
  ...searchToQuery(search)
});

/** Search terms of the list */
export const useSearch = () => useStatePart(getSearch, serializeSearch, parseSearch);

export const useSearchSetter = () => useStatePartSetter(getSearch, setQuerySearch);

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

const getImages = (query: Query) => imagesFromQuery(query, true);
const parseImages = (serialized: string) => serialized === 'true';
// the param is left out with the images, so it is replaced
const setQueryImages = (query: Query, hasImages: boolean): Query => ({
  ...omitQuery(query, IMAGES_PARAMS),
  ...imagesToQuery(hasImages)
});

/** The comfortable table with the images of the objects (the default), or the compact one without them */
export const useListImages = () => {
  const hasImages = useStatePart(getImages, String, parseImages);
  const setImages = useStatePartSetter(getImages, setQueryImages);
  const toggleImages = useCallback(() => setImages(hasImages => !hasImages), [setImages]);
  return [hasImages, toggleImages] as const;
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
