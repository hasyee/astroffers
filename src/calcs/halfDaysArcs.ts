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

export const getHalfDayArcFactory = (solarNoon: Timestamp, { lat, lon }: Loc, altitudeLimit: Rad = 0) => (
  eqCoordsOnJ2000: Eq
): HalfDayArc => {
  const siderealSolarNoon = timeToLst(solarNoon, lon, false);
  const { ra, de } = getEqCoordsOnDate(eqCoordsOnJ2000, solarNoon);
  const ha = acos((sin(altitudeLimit) - sin(lat) * sin(de)) / (cos(lat) * cos(de)));
  if (!Number.isFinite(ha)) return {};
  const k1 = floor((ra + ha - siderealSolarNoon) / PI2);
  const k2 = floor((ra - ha - siderealSolarNoon) / PI2);
  const nextCrossing1 = ra + ha - PI2 * k1;
  const nextCrossing2 = ra - ha - PI2 * k2;
  const startsWithRising = isRising(nextCrossing1, lat, ra, de);
  const start = lstToTime(startsWithRising ? nextCrossing1 : nextCrossing2, lon);
  const end = lstToTime(startsWithRising ? nextCrossing2 : nextCrossing1, lon);
  return { start, end };
};
