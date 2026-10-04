import { type PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { useStateSetter, useStateValue } from '../provider/state.hooks';
import StateProvider from '../provider/state.provider';
import { LocationContext, useCoords } from './location.hooks';
import type { Place } from './location.types';
import { isSameCoords, parseStoredPlace } from './location.utils';

/** Follows the coordinates of the query (e.g. of a shared link) with the stored place, without a name */
function StoredPlaceSync({ children }: PropsWithChildren<{}>) {
  const coords = useCoords();
  const stored = useStateValue(LocationContext);
  const setStored = useStateSetter(LocationContext);

  useEffect(() => {
    if (!isSameCoords(coords, stored.coords)) setStored({ coords, name: '' });
  }, [coords, stored, setStored]);

  return <>{children}</>;
}

export default function LocationProvider({ children }: PropsWithChildren<{}>) {
  const initialState = useMemo(() => parseStoredPlace(localStorage.getItem('location')), []);

  const handleChange = useCallback((place: Place) => localStorage.setItem('location', JSON.stringify(place)), []);

  return (
    <StateProvider context={LocationContext} initialState={initialState} onChange={handleChange}>
      <StoredPlaceSync>{children}</StoredPlaceSync>
    </StateProvider>
  );
}
