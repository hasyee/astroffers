import type { Degrees } from '../calculator/calculator.types';

/** Geographic coordinates in degrees, as entered by the user. */
export type Coords = { lng: Degrees; lat: Degrees };

export type Place = { coords: Coords; name: string };

/** Item of the Nominatim search API response (only the fields in use). */
export type NominatimPlace = { place_id: number; display_name: string; lon: string; lat: string };
