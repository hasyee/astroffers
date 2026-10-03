import { useCallback, useSyncExternalStore } from 'react';

/** Width from which the desktop layout (filter panel and table) is displayed */
export const WIDE_SCREEN_QUERY = '(min-width: 960px)';

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
