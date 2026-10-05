import type { ArcMin, Degrees, NgcInfo, NgcObject, Timestamp } from '../calculator/calculator.types';
import { eqToAz } from '../calculator/calculator.coords';
import { getLocation, normalizeRad, radToDeg } from '../calculator/calculator.units';
import type { Coords } from '../location/location.types';

const MIN_FIELD_OF_VIEW: Degrees = 2;
const MAX_FIELD_OF_VIEW: Degrees = 60;

/** Field of view of Stellarium Web: the object with its surroundings, to find it on the sky */
const getFieldOfView = (size?: [ArcMin, ArcMin]): Degrees =>
  Math.min(MAX_FIELD_OF_VIEW, Math.max(MIN_FIELD_OF_VIEW, size ? (Math.max(...size) * 5) / 60 : 0));

/**
 * Name of the object for Stellarium Web, from its id: `M27`, `NGC884` (the second object of M51 is `NGC5195`); the
 * bodies of the Solar System have their own (`Mars`, `A847 PA` for Iris)
 */
const getSkySourceName = ({ id, skySource }: NgcObject) => skySource ?? id.toUpperCase();

/**
 * Link to the object on Stellarium Web (`stellarium-web.org/skysource/<name>`) at the time and place. Its name
 * selects the object, but Stellarium does not know every NGC object (e.g. NGC 6995): the view is pointed to the
 * object by its altitude and azimuth too.
 */
export const getStellariumWebUrl = ({ object, eqCoordsOnDate }: NgcInfo, time: Timestamp, coords: Coords) => {
  const { az, alt } = eqToAz(time, getLocation(coords.lat, coords.lng), eqCoordsOnDate);
  const params = new URLSearchParams({
    date: new Date(Math.round(time / 1000) * 1000).toISOString().replace('.000Z', 'Z'),
    lat: coords.lat.toFixed(4),
    lng: coords.lng.toFixed(4),
    az: radToDeg(normalizeRad(az)).toFixed(2),
    alt: radToDeg(alt).toFixed(2),
    fov: getFieldOfView(object.size).toFixed(2)
  });
  return `https://stellarium-web.org/skysource/${encodeURIComponent(getSkySourceName(object))}?${params}`;
};
