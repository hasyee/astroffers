import { type PropsWithChildren, useCallback, useMemo } from 'react';
import StateProvider from '../provider/state.provider';
import { SearchContext, SortContext } from './list.hooks';
import type { SortBy } from './list.types';
import { parseStoredSortBy } from './list.utils';

export default function ListProvider({ children }: PropsWithChildren<{}>) {
  const initialSortBy = useMemo(() => parseStoredSortBy(localStorage.getItem('sortBy')), []);

  const handleSortByChange = useCallback((sortBy: SortBy) => localStorage.setItem('sortBy', sortBy), []);

  return (
    <StateProvider context={SortContext} initialState={initialSortBy} onChange={handleSortByChange}>
      <StateProvider context={SearchContext}>{children}</StateProvider>
    </StateProvider>
  );
}
