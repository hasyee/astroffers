import { hmsToRad, dmsToRad, radToHms, PI2 } from './units';
import { Rad, Deg, Eq, Az, Loc } from './types';

const { sin, cos, atan2, asin } = Math;

export const getEqCoordsOfObject = ({ ra_hr, ra_min, dec_deg, dec_min }) => ({
  ra: hmsToRad({ hour: Number(ra_hr), min: Number(ra_min) }),
  de: dmsToRad({ deg: Number(dec_deg), min: Number(dec_min) })
});

export const eqToAz = (lst: Rad, { lat }: Loc, { ra, de }: Eq): Az => {
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
