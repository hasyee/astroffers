import { type PropsWithChildren, useCallback, useEffect, useMemo } from 'react';
import { useStateSetter, useStateValue } from '../provider/state.hooks';
import StateProvider from '../provider/state.provider';
import { LocationContext, useCoords } from './location.hooks';
import type { Place } from './location.types';
import { readStored, writeStored } from '../storage/storage.utils';
import { isSameCoords } from './location.utils';

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
  const initialState = useMemo(() => readStored('location'), []);

  const handleChange = useCallback((place: Place) => writeStored('location', place), []);

  return (
    <StateProvider context={LocationContext} initialState={initialState} onChange={handleChange}>
      <StoredPlaceSync>{children}</StoredPlaceSync>
    </StateProvider>
  );
}
