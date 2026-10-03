import { type PropsWithChildren, useCallback, useMemo } from 'react';
import StateProvider from '../provider/state.provider';
import { LocationContext } from './location.hooks';
import type { Place } from './location.types';
import { parseStoredPlace } from './location.utils';

export default function LocationProvider({ children }: PropsWithChildren<{}>) {
  const initialState = useMemo(() => parseStoredPlace(localStorage.getItem('location')), []);

  const handleChange = useCallback((place: Place) => localStorage.setItem('location', JSON.stringify(place)), []);

  return (
    <StateProvider context={LocationContext} initialState={initialState} onChange={handleChange}>
      {children}
    </StateProvider>
  );
}
