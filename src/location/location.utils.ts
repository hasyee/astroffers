import type { Query } from '../router/router.types';
import type { Coords, Place } from './location.types';

export const defaultPlace: Place = { coords: { lng: 19, lat: 47 }, name: '' };

export const getPlaceShortName = ({ coords: { lng, lat }, name }: Place) =>
  name
    .split(',')
    .map(term => term.trim())
    .find(term => term) || `${lng.toFixed(2)} ${lat.toFixed(2)}`;

/** Restores a place from its stored JSON; falls back to the default for anything malformed. */
export const parseStoredPlace = (json: string | null): Place => {
  if (!json) return defaultPlace;
  try {
    const { coords, name } = JSON.parse(json);
    if (!Number.isFinite(coords?.lng) || !Number.isFinite(coords?.lat)) return defaultPlace;
    return { coords: { lng: coords.lng, lat: coords.lat }, name: typeof name === 'string' ? name : '' };
  } catch (error) {
    console.error(error);
    return defaultPlace;
  }
};

/** Query params of the coordinates: `lng`, `lat` in degrees (the name of the place is stored only) */
export const COORDS_PARAMS = ['lng', 'lat'] as const;

const parseDegrees = (value: string | undefined, limit: number) => {
  const degrees = Number(value);
  return value?.trim() && Number.isFinite(degrees) && Math.abs(degrees) <= limit ? degrees : null;
};

export const coordsFromQuery = (query: Query, fallback: Coords): Coords => {
  const lng = parseDegrees(query.lng, 180);
  const lat = parseDegrees(query.lat, 90);
  return lng !== null && lat !== null ? { lng, lat } : fallback;
};

export const coordsToQuery = ({ lng, lat }: Coords): Query => ({ lng: String(lng), lat: String(lat) });

export const isSameCoords = (a: Coords, b: Coords) => a.lng === b.lng && a.lat === b.lat;
