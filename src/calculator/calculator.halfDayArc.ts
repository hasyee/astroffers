import type { Eq, Interval, Position, Radians, Timestamp } from './calculator.types';
import { PI2 } from './calculator.units';
import { eqToAz } from './calculator.coords';
import { timeToLst, lstToTime } from './calculator.lst';

const { acos, ceil, sin, cos, sqrt } = Math;

const isRising = (siderealTime: Radians, lat: Radians, ra: Radians, de: Radians) => {
  const cosDe = cos(de);
  const cosLat = cos(lat);
  const ha = ra - siderealTime;
  const derivate = (cosDe * cosLat * sin(ha)) / sqrt(1 - (cosDe * cosLat * cos(ha) + sin(de) * sin(lat)));
  return derivate > 0;
};

/**
 * The next (or current) interval when the object is above the given altitude:
 * `null` if it never rises above it, open-ended if it never sets below it.
 */
export const getHalfDayArc = (
  time: Timestamp,
  { lat, lon }: Position,
  minAltitude: Radians,
  { ra, de }: Eq
): Interval | null => {
  const siderealTime = timeToLst(time, lon, false);
  const ha = acos((sin(minAltitude) - sin(lat) * sin(de)) / (cos(lat) * cos(de)));
  if (!Number.isFinite(ha)) {
    return eqToAz(time, { lat, lon }, { ra, de }).alt > minAltitude ? { start: -Infinity, end: Infinity } : null;
  }
  const k1 = ceil((siderealTime - ha - ra) / PI2);
  const k2 = ceil((siderealTime + ha - ra) / PI2);
  const t1 = ra + ha + PI2 * k1;
  const t2 = ra - ha + PI2 * k2;
  const [next, other] = t1 < t2 ? [t1, t2] : [t2, t1];
  return isRising(next, lat, ra, de)
    ? { start: lstToTime(next, lon), end: lstToTime(other, lon) }
    : { start: lstToTime(other - PI2, lon), end: lstToTime(next, lon) };
};
