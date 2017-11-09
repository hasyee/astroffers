import { hmsToRad, dmsToRad, radToHmsString, PI2, degToRad } from './units';
import { timeToLst } from './lst';
import { Rad, Deg, Eq, Az, Loc, Timestamp, Ecl } from './types';

const OBLIQUITY_OF_THE_ECLIPTIC = degToRad(23.439);
const { sin, cos, atan2, asin } = Math;

export const eqToAz = (time: Timestamp, { lat, lon }: Loc, { ra, de }: Eq): Az => {
  const lst = timeToLst(time, lon);
  const h = lst - ra;
  const sinLat = sin(lat);
  const cosLat = cos(lat);
  const sinH = sin(h);
  const cosH = cos(h);
  const sinDe = sin(de);
  const cosDe = cos(de);
  return {
    az: PI2 - atan2(cosDe * sinH, -sinLat * cosDe * cosH + cosLat * sinDe),
    alt: asin(sinLat * sinDe + cosLat * cosDe * cosH)
  };
};

export const eclToEq = ({ lon }: Ecl): Eq => ({
  ra: atan2(cos(lon), cos(OBLIQUITY_OF_THE_ECLIPTIC) * sin(lon)),
  de: asin(sin(OBLIQUITY_OF_THE_ECLIPTIC) * sin(lon))
});
