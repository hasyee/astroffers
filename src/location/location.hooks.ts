import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Coords, NominatimPlace, Place } from './location.types';
import { useDebounce } from '../debounce/debounce.hooks';
import { createStateContext, useStateSetter, useStateValue } from '../provider/state.hooks';
import { useQuerySelector, useQuerySetter } from '../router/router.hooks';
import { parseQuery, serializeQuery } from '../router/router.utils';
import type { Query } from '../router/router.types';
import {
  MY_LOCATION_NAME,
  coordsFromQuery,
  coordsToQuery,
  defaultPlace,
  getPlaceShortName,
  isMyLocation,
  isSameCoords,
  roundMyLocation
} from './location.utils';

/** Refresh interval of the location of the device while the app follows it */
const FOLLOW_INTERVAL = 60 * 1000;

/** The stored place (`localStorage`), the only place of its name; the coordinates come from the query */
export const LocationContext = createStateContext<Place>(defaultPlace);

const getCoords = (query: Query) => coordsFromQuery(query, defaultPlace.coords);

/** Name of the stored place, when it is the place of the coordinates */
const toPlace = (coords: Coords, stored: Place): Place => ({
  coords,
  name: isSameCoords(coords, stored.coords) ? stored.name : ''
});

const serializeCoords = (coords: Coords) => serializeQuery(coordsToQuery(coords));

export const useCoords = () => {
  // selected in a serialized form, to keep their identity while other params change
  const serialized = useQuerySelector(query => serializeCoords(getCoords(query)));
  return useMemo(() => getCoords(parseQuery(serialized)), [serialized]);
};

export const useLocation = (): Place => {
  const coords = useCoords();
  const stored = useStateValue(LocationContext);
  return useMemo(() => toPlace(coords, stored), [coords, stored]);
};

/** Stores the place with its name, and sets its coordinates in the query */
export const useLocationSetter = () => {
  const stored = useStateValue(LocationContext);
  const setStored = useStateSetter(LocationContext);
  const setQuery = useQuerySetter();
  return useCallback(
    (update: Place | ((place: Place) => Place)) => {
      const place = toPlace(getCoords(parseQuery(window.location.search)), stored);
      const nextPlace = typeof update === 'function' ? update(place) : update;
      setStored(nextPlace);
      setQuery(query => ({ ...query, ...coordsToQuery(nextPlace.coords) }));
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
      const coords = roundMyLocation(await geolocation.fetch());
      // followed from now on (see `useLocationFollowing`)
      setLocation({ coords, name: MY_LOCATION_NAME });
      setIsFetchingLocation(false);
      onFinish();
    } catch (error) {
      setLocationFetchingError((error as { message: string }).message);
      setIsFetchingLocation(false);
    }
  }, [setIsFetchingLocation, geolocation, setLocation, onFinish]);

  return { isFetchingLocation, locationFetchingError, fetchLocation };
};

/**
 * Follows the location of the device while it is chosen ("My location"): refreshes it on start, every minute and
 * whenever the app gets visible again. Typed coordinates or a searched place stop it; a failed positioning (e.g.
 * offline) keeps the last location.
 */
export const useLocationFollowing = () => {
  const geolocation = useGeolocation();
  const location = useLocation();
  const setLocation = useLocationSetter();
  const isFollowing = isMyLocation(location);
  // read at the refresh, not to restart the following on every change
  const locationRef = useRef(location);
  const setLocationRef = useRef(setLocation);
  useEffect(() => {
    locationRef.current = location;
    setLocationRef.current = setLocation;
  }, [location, setLocation]);

  useEffect(() => {
    if (!isFollowing) return;
    let isActive = true;
    const refresh = async () => {
      try {
        const coords = roundMyLocation(await geolocation.fetch());
        const place = locationRef.current;
        if (isActive && isMyLocation(place) && !isSameCoords(place.coords, coords))
          setLocationRef.current({ coords, name: MY_LOCATION_NAME });
      } catch {
        // the last location is kept
      }
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    refresh();
    const interval = setInterval(refresh, FOLLOW_INTERVAL);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isActive = false;
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isFollowing, geolocation]);
};

export const useSearch = () => {
  const nominatim = useNominatim();
  const location = useLocation();
  // the search starts from the name of a searched place, empty for the location of the device
  const name = isMyLocation(location) ? '' : location.name;

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
