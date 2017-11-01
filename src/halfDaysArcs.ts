import { Timestamp, Loc, Eq, HalfDayArc } from './types';
import { hmsToRad, dmsToRad, PI2 } from './units';
import { timeToLst, lstToTime } from './lst';
import { getEqCoordsOnDate } from './corrections';

const { asin, acos, tan, ceil, PI, sin, cos, floor } = Math;

export const getHalfDayArcFactory = (noon: Timestamp, { lat, lon }: Loc) => (eqCoordsOnJ2000: Eq): HalfDayArc => {
  const siderealNoon = timeToLst(noon, lon, false);
  const { ra, de } = getEqCoordsOnDate(eqCoordsOnJ2000, noon);
  const psi = acos(-tan(lat) * tan(de));
  const nextCrossing1 = ra + psi;
  const nextCrossing2 = ra - psi;
  console.log(new Date(lstToTime(nextCrossing1, lon)).toLocaleString());
  console.log(new Date(lstToTime(nextCrossing2, lon)).toLocaleString());
  return { rise: 0, set: 0 };
};
