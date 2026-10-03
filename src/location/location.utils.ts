import type { Place } from './location.types';

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
