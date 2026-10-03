import { useState, useCallback } from 'react';
import type { Coords, NominatimPlace, Place } from './location.types';
import { useDebounce } from '../debounce/debounce.hooks';
import { createStateContext, useStateSelector, useStateSetter, useStateValue } from '../provider/state.hooks';
import { defaultPlace, getPlaceShortName } from './location.utils';

export const LocationContext = createStateContext<Place>(defaultPlace);

export const useLocation = () => useStateValue(LocationContext);

export const useLocationSetter = () => useStateSetter(LocationContext);

export const useCoords = () => useStateSelector(LocationContext, location => location.coords);

export const useLocationShortName = () => useStateSelector(LocationContext, getPlaceShortName);

const constant =
  <T>(r: T) =>
  () =>
    r;

export const useGeolocation = constant({
  fetch: () =>
    new Promise<Coords>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(
        response => resolve({ lng: Number(response.coords.longitude), lat: Number(response.coords.latitude) }),
        error => reject(error),
        { timeout: 10000 }
      )
    )
});

export const useNominatim = constant({
  search: (query: string): Promise<NominatimPlace[]> =>
    fetch(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&namedetails=1`)
      .then(resp => resp.json() as Promise<NominatimPlace[]>)
      .catch(() => [])
});

export const useMyLocation = (onFinish: () => void) => {
  const geolocation = useGeolocation();
  const setLocation = useLocationSetter();
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationFetchingError, setLocationFetchingError] = useState<string | null>(null);

  const fetchLocation = useCallback(async () => {
    try {
      setIsFetchingLocation(true);
      setLocationFetchingError(null);
      const coords = await geolocation.fetch();
      setLocation({ coords, name: '' });
      setIsFetchingLocation(false);
      onFinish();
    } catch (error) {
      setLocationFetchingError((error as { message: string }).message);
      setIsFetchingLocation(false);
    }
  }, [setIsFetchingLocation, geolocation, setLocation, onFinish]);

  return { isFetchingLocation, locationFetchingError, fetchLocation };
};

export const useSearch = () => {
  const nominatim = useNominatim();
  const { name } = useLocation();

  const [items, setItems] = useState<NominatimPlace[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [query, setQuery] = useDebounce<string>(
    name,
    useCallback(
      async (query: string) => {
        if (!query) return setItems([]);
        const results = await nominatim.search(query);
        setIsSearching(false);
        setItems(results);
        setHasSearched(true);
      },
      [nominatim, setIsSearching, setItems, setHasSearched]
    )
  );

  const handleQueryChange = useCallback(
    (query: string) => {
      setIsSearching(true);
      setQuery(query);
    },
    [setIsSearching, setQuery]
  );

  return { query, handleQueryChange, items, isSearching, hasSearched };
};
