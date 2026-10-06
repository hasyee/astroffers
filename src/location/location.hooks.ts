import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Coords, NominatimPlace, Place } from './location.types';
import { useDebounce } from '../debounce/debounce.hooks';
import { createStateContext, useStateSetter, useStateValue } from '../provider/state.hooks';
import { useQueryParams, useQueryParamsSetter } from '../query/query.hooks';
import {
  COORDS_PARAMS,
  MY_LOCATION_NAME,
  defaultPlace,
  getPlaceShortName,
  isMyLocation,
  isSameCoords,
  roundMyLocation
} from './location.utils';

/** Refresh interval of the location of the device while the app follows it */
const FOLLOW_INTERVAL = 60 * 1000;

/**
 * The name of the place of the coordinates of the query (stored in `localStorage`; empty for typed coordinates). The
 * coordinates change by `useLocationSetter` only, with their name (`restoreQuery` clears it for a link to another place)
 */
export const LocationNameContext = createStateContext('');

/** The coordinates of the query, keeping their identity while other params change */
export const useCoords = (): Coords => {
  const { lng, lat } = useQueryParams(COORDS_PARAMS);
  return useMemo(() => (lng !== null && lat !== null ? { lng, lat } : defaultPlace.coords), [lng, lat]);
};

export const useLocation = (): Place => {
  const coords = useCoords();
  const name = useStateValue(LocationNameContext);
  return useMemo(() => ({ coords, name }), [coords, name]);
};

/** Sets the coordinates of the place in the query, and stores its name */
export const useLocationSetter = () => {
  const setName = useStateSetter(LocationNameContext);
  const setCoords = useQueryParamsSetter(COORDS_PARAMS);
  return useCallback(
    ({ coords, name }: Place) => {
      setName(name);
      setCoords(coords);
    },
    [setName, setCoords]
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

  const clearLocationFetchingError = useCallback(() => setLocationFetchingError(null), []);

  return { isFetchingLocation, locationFetchingError, fetchLocation, clearLocationFetchingError };
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
