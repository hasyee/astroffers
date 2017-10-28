import { hmsToRad, dmsToRad, radToHms, PI2 } from './units';
import { getLst } from './lst';
import { Rad, Deg, Eq, Az, Loc, Timestamp } from './types';

const { sin, cos, atan2, asin } = Math;

export const eqToAz = (time: Timestamp, { lat, lon }: Loc, { ra, de }: Eq): Az => {
  //console.log('DE:', de);
  //console.log('RA:', ra);
  const lst = getLst(time, lon);
  //console.log('LST:', radToHms(lst));
  const h = lst - ra;
  //console.log('H:', radToHms(h));
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
