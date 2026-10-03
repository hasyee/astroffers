import type { Eq, Position, Radians, Timestamp } from './calculator.types';
import { lstToTime } from './calculator.lst';

const { abs, floor, ceil, min, PI, cos, sin, sqrt } = Math;

/** Sidereal times between t1 and t2 when the altitude has a local extremum (upper or lower transit) */
const getRootsOfFirstDerivate = (ra: Radians, t1: Radians, t2: Radians): Radians[] => {
  const k1 = floor((ra - t1) / PI);
  const k2 = ceil((ra - t2) / PI);
  const smallestK = min(k1, k2);
  return Array.from({ length: abs(k2 - k1) + 1 }, (_, i) => ra - PI * (smallestK + i));
};

const getValueOfSecondDerivate =
  ({ de, ra }: Eq, lat: Radians) =>
  (siderealTime: Radians) => {
    const sinDe = sin(de);
    const sinLat = sin(lat);
    const cosDe = cos(de);
    const cosLat = cos(lat);
    const sinHa = sin(ra - siderealTime);
    const cosHa = cos(ra - siderealTime);
    const A = cosDe ** 2 * cosLat ** 2 * sinHa ** 2 * (cosDe * cosLat * cosHa + sinDe * sinLat);
    const B = (1 - (cosDe * cosLat * cosHa + sinDe * sinLat) ** 2) ** (3 / 2);
    const C = cosDe * cosLat * cosHa;
    const D = sqrt(1 - (cosDe * cosLat * cosHa + sinDe * sinLat) ** 2);
    return A / B - C / D;
  };

/**
 * Time of the upper transit between two (non-normalized) sidereal times, typically the noon of the date
 * and the next noon, or `null` if there is none.
 */
export const getTransit = (eq: Eq, { lat, lon }: Position, t1: Radians, t2: Radians): Timestamp | null => {
  const roots = getRootsOfFirstDerivate(eq.ra, t1, t2);
  const secondDerivates = roots.map(getValueOfSecondDerivate(eq, lat));
  const transitIndex = secondDerivates.findIndex(value => value < 0); // upper transit condition
  return transitIndex >= 0 ? lstToTime(roots[transitIndex], lon) : null;
};
