import { createNumParam } from '../query/query.params';
import type { Coords, Place } from './location.types';

export const defaultPlace: Place = { coords: { lng: 19, lat: 47 }, name: '' };

/** The name of the location of the device: the app follows it (see `useLocationFollowing`) */
export const MY_LOCATION_NAME = 'My location';

export const isMyLocation = (place: Place) => place.name === MY_LOCATION_NAME;

/**
 * The location of the device rounded to about a kilometer: precise enough for the sky, and the jitter of the
 * positioning does not recalculate the result every minute
 */
export const roundMyLocation = ({ lng, lat }: Coords): Coords => ({
  lng: Math.round(lng * 100) / 100,
  lat: Math.round(lat * 100) / 100
});

export const getPlaceShortName = ({ coords: { lng, lat }, name }: Place) =>
  name
    .split(',')
    .map(term => term.trim())
    .find(term => term) || `${lng.toFixed(2)} ${lat.toFixed(2)}`;

/**
 * Query params of the coordinates: `lng`, `lat` in degrees (always in the query, completed by `restoreQuery`; the name of
 * the place is stored only)
 */
export const LNG_PARAM = createNumParam('lng', null, { min: -180, max: 180 });
export const LAT_PARAM = createNumParam('lat', null, { min: -90, max: 90 });

/** The params of the coordinates, by their names */
export const COORDS_PARAMS = { lng: LNG_PARAM, lat: LAT_PARAM };

export const isSameCoords = (a: Coords, b: Coords) => a.lng === b.lng && a.lat === b.lat;
