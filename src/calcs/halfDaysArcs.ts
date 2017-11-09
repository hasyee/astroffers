import { Timestamp, Loc, Eq, HalfDayArc, Rad } from './types';
import { hmsToRad, dmsToRad, PI2 } from './units';
import { timeToLst, lstToTime } from './lst';
import { getEqCoordsOnDate } from './corrections';

const { asin, acos, tan, ceil, PI, sin, cos, floor, sqrt, round } = Math;

export const isRising = (siderealTime: Rad, lat: Rad, ra: Rad, de: Rad): boolean => {
  const t = siderealTime;
  const cosDe = cos(de);
  const cosLat = cos(lat);
  const ha = ra - t;
  const derivate = cosDe * cosLat * sin(ha) / sqrt(1 - (cosDe * cosLat * cos(ha) + sin(de) * sin(lat)));
  return derivate > 0;
};

export const getHalfDayArcFactory = (solarNoon: Timestamp, { lat, lon }: Loc) => (eqCoordsOnJ2000: Eq): HalfDayArc => {
  const siderealSolarNoon = timeToLst(solarNoon, lon, false);
  const { ra, de } = getEqCoordsOnDate(eqCoordsOnJ2000, solarNoon);
  const psi = acos(-tan(lat) * tan(de));
  if (!Number.isFinite(psi)) return {};
  const k1 = floor((ra + psi - siderealSolarNoon) / PI2);
  const k2 = floor((ra - psi - siderealSolarNoon) / PI2);
  const nextCrossing1 = ra + psi - PI2 * k1;
  const nextCrossing2 = ra - psi - PI2 * k2;
  const startsWithRising = isRising(nextCrossing1, lat, ra, de);
  const rise = lstToTime(startsWithRising ? nextCrossing1 : nextCrossing2, lon);
  const set = lstToTime(startsWithRising ? nextCrossing2 : nextCrossing1, lon);
  const noon = round((set + rise) / 2);
  return { rise, noon, set };
};
