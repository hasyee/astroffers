import { Timestamp, Loc, Eq, Interval, Rad } from './types';
import { hmsToRad, dmsToRad, PI2 } from './units';
import { eqToAz } from './coords';
import { toMidnight, toPrevDay } from './time';
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

export default (time: Timestamp, { lat, lon }: Loc, minAltitude: Rad = 0, { ra, de }: Eq): Interval => {
  const siderealTime = timeToLst(time, lon, false);
  const ha = acos((sin(minAltitude) - sin(lat) * sin(de)) / (cos(lat) * cos(de)));
  if (!Number.isFinite(ha)) {
    return eqToAz(time, { lat, lon }, { ra, de }).alt > minAltitude ? { start: -Infinity, end: Infinity } : null;
  }
  const k1 = ceil((siderealTime - ha - ra) / PI2);
  const k2 = ceil((siderealTime + ha - ra) / PI2);
  const t1 = ra + ha + PI2 * k1;
  const t2 = ra - ha + PI2 * k2;
  const [ next, other ] = t1 < t2 ? [ t1, t2 ] : [ t2, t1 ];
  return isRising(next, lat, ra, de)
    ? {
        start: lstToTime(next, lon),
        end: lstToTime(other, lon)
      }
    : {
        start: lstToTime(other - PI2, lon),
        end: lstToTime(next, lon)
      };
};
