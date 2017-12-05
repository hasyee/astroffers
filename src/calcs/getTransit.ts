import { Eq, Loc, Interval, Rad, Timestamp } from './types';
import { timeToLst, lstToTime } from './lst';
import { toNoon, toNextDay } from './time';

const { abs, floor, ceil, PI, cos, sin, sqrt } = Math;

const getRootsOfFirstDerivate = (ra: Rad, t1: Rad, t2: Rad): Rad[] => {
  const k1 = floor((ra - t1) / PI);
  const k2 = ceil((ra - t2) / PI);
  const smallestK = Math.min(k1, k2);
  //console.log(k1, k2);
  return Array.from({ length: abs(k2 - k1) + 1 }).map((_, i) => ra - PI * (smallestK + i));
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

export default ({ de, ra }: Eq, { lat, lon }: Loc, date: Timestamp): Timestamp => {
  const t1 = timeToLst(toNoon(date), lon, false);
  const t2 = timeToLst(toNoon(toNextDay(date)), lon, false);
  //console.log(new Date(lstToTime(t1, lon)), new Date(lstToTime(t2, lon)));
  const roots = getRootsOfFirstDerivate(ra, t1, t2); // all transit
  //console.log(roots.map(r => new Date(lstToTime(r, lon))));
  const secondDerivates = roots.map(getValueOfSecondDerivate({ de, ra }, lat));
  //console.log(secondDerivates);
  const transitIndex = secondDerivates.findIndex(sd => sd < 0); // upper transit condition
  //console.log(transitIndex);
  return transitIndex >= 0 ? lstToTime(roots[transitIndex], lon) : null;
};
