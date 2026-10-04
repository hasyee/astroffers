import { useCallback, useSyncExternalStore } from 'react';

/** Width from which the desktop layout (summary and table) is displayed */
export const WIDE_SCREEN_QUERY = '(min-width: 800px)';

export const useMediaQuery = (query: string) => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener('change', onChange);
      return () => mediaQueryList.removeEventListener('change', onChange);
    },
    [query]
  );
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
};

export const useIsWideScreen = () => useMediaQuery(WIDE_SCREEN_QUERY);

/** Width from which the wide layout has room for the filter panel; below it the filter is in a drawer */
export const FILTER_PANEL_QUERY = '(min-width: 1110px)';

export const useHasFilterPanel = () => useMediaQuery(FILTER_PANEL_QUERY);
