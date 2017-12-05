import { Eq, Loc, Interval, Rad, Timestamp } from './types';
import { timeToLst, lstToTime } from './lst';

const { abs, floor, ceil, PI, cos, sin, sqrt } = Math;

const getRootsOfFirstDerivate = (ra: Rad, t1: Rad, t2: Rad): Rad[] => {
  const k1 = floor((ra - t1) / PI);
  const k2 = ceil((ra - t2) / PI);
  return Array.from({ length: abs(k2 - k1) }).map((_, i) => ra - PI * (k1 + i));
};

const getValueOfSecondDerivate = ({ de, ra }: Eq, lat: Rad) => (siderealTime: Rad): number => {
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

export default ({ de, ra }: Eq, { lat, lon }: Loc, { start, end }: Interval): Timestamp => {
  const t1 = timeToLst(start, lon, false);
  const t2 = timeToLst(end, lon, false);
  const roots = getRootsOfFirstDerivate(ra, t1, t2); // all transit
  const secondDerivates = roots.map(getValueOfSecondDerivate({ de, ra }, lat));
  const transitIndex = secondDerivates.findIndex(sd => sd < 0); // upper transit condition
  return transitIndex > 0 ? lstToTime(roots[transitIndex], lon) : null;
};
