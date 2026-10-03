import { type PropsWithChildren, useCallback, useMemo } from 'react';
import type { ObjectFilter } from '../calculator/calculator.types';
import StateProvider from '../provider/state.provider';
import { FilterContext } from './filter.hooks';
import { parseStoredFilter } from './filter.utils';

export default function FilterProvider({ children }: PropsWithChildren<{}>) {
  const initialState = useMemo(() => parseStoredFilter(localStorage.getItem('filter')), []);

  const handleChange = useCallback(
    (filter: ObjectFilter) => localStorage.setItem('filter', JSON.stringify(filter)),
    []
  );

  return (
    <StateProvider context={FilterContext} initialState={initialState} onChange={handleChange}>
      {children}
    </StateProvider>
  );
}
