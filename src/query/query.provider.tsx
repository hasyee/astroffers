import { type PropsWithChildren, useCallback, useMemo } from 'react';
import StateProvider from '../provider/state.provider';
import { StoredStateContext } from './query.hooks';
import type { StoredState } from './query.types';
import { getStoredState } from './query.utils';

/** The stored state of the main view (see `StoredState`) */
export default function StoredStateProvider({ children }: PropsWithChildren<{}>) {
  const initialState = useMemo(getStoredState, []);

  const handleChange = useCallback(({ sortBy, search, filter }: StoredState) => {
    localStorage.setItem('sortBy', sortBy);
    localStorage.setItem('search', JSON.stringify(search));
    localStorage.setItem('filter', JSON.stringify(filter));
  }, []);

  return (
    <StateProvider context={StoredStateContext} initialState={initialState} onChange={handleChange}>
      {children}
    </StateProvider>
  );
}
