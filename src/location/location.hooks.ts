import { useState, useCallback, useMemo } from 'react';
import type { Coords, NominatimPlace, Place } from './location.types';
import { useDebounce } from '../debounce/debounce.hooks';
import { createStateContext, useStateSelector, useStateSetter, useStateValue } from '../provider/state.hooks';
import { hasQueryState } from '../query/query.utils';
import { useQuerySelector, useQuerySetter } from '../router/router.hooks';
import { parseQuery, serializeQuery } from '../router/router.utils';
import type { Query } from '../router/router.types';
import { coordsFromQuery, coordsToQuery, defaultPlace, getPlaceShortName, isSameCoords } from './location.utils';

/**
 * The stored place (`localStorage`), the only place of its name; the coordinates come from the query while it
 * holds the state (see `StoredState`)
 */
export const LocationContext = createStateContext<Place>(defaultPlace);

const getCoords = (query: Query) => coordsFromQuery(query, defaultPlace.coords);

/** Name of the stored place, when it is the place of the coordinates */
const toPlace = (coords: Coords, stored: Place): Place => ({
  coords,
  name: isSameCoords(coords, stored.coords) ? stored.name : ''
});

const serializeCoords = (coords: Coords) => serializeQuery(coordsToQuery(coords));

export const useCoords = () => {
  // selected in a serialized form, to keep their identity while the state moves between the query and the store
  const queryCoords = useQuerySelector(query => (hasQueryState(query) ? serializeCoords(getCoords(query)) : null));
  const storedCoords = useStateSelector(LocationContext, place => serializeCoords(place.coords));
  const serialized = queryCoords ?? storedCoords;
  return useMemo(() => getCoords(parseQuery(serialized)), [serialized]);
};

export const useLocation = (): Place => {
  const coords = useCoords();
  const stored = useStateValue(LocationContext);
  return useMemo(() => toPlace(coords, stored), [coords, stored]);
};

/** Stores the place with its name, and sets its coordinates in the query while it holds the state */
export const useLocationSetter = () => {
  const stored = useStateValue(LocationContext);
  const setStored = useStateSetter(LocationContext);
  const setQuery = useQuerySetter();
  return useCallback(
    (update: Place | ((place: Place) => Place)) => {
      const query = parseQuery(window.location.search);
      const place = hasQueryState(query) ? toPlace(getCoords(query), stored) : stored;
      const nextPlace = typeof update === 'function' ? update(place) : update;
      setStored(nextPlace);
      if (hasQueryState(query)) setQuery(query => ({ ...query, ...coordsToQuery(nextPlace.coords) }));
    },
    [stored, setStored, setQuery]
  );
};

export const useLocationShortName = () => getPlaceShortName(useLocation());

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
