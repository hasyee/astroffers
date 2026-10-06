import { useCallback, useMemo, useRef, useState } from 'react';
import { useResultList } from '../result/result.hooks';
import { useQueryParam, useQueryParams, useQueryParamSetter, useQueryParamsSetter } from '../query/query.hooks';
import type { ListSearch } from './list.types';
import { IMAGES_PARAM, isSearchEmpty, matchesSearch, SEARCH_PARAMS, SORT_PARAM, sorters } from './list.utils';

/** Order of the list */
export const useSortBy = () => useQueryParam(SORT_PARAM);

export const useSortBySetter = () => useQueryParamSetter(SORT_PARAM);

/** Search terms of the list, keeping their identity while other params change */
export const useSearch = (): ListSearch => useQueryParams(SEARCH_PARAMS);

/** Setter of the search terms, all of the given ones at once */
export const useSearchSetter = () => useQueryParamsSetter(SEARCH_PARAMS);

export const useSearchValueSetter = (key: keyof ListSearch) => {
  const setSearch = useSearchSetter();
  return useCallback((value: string) => setSearch({ [key]: value }), [setSearch, key]);
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

/** The comfortable table with the images of the objects (the default), or the compact one without them */
export const useListImages = () => {
  const hasImages = useQueryParam(IMAGES_PARAM);
  const setImages = useQueryParamSetter(IMAGES_PARAM);
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
