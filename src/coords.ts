import { hmsToDeg, dmsToDeg } from './units';
import { Eq, Az } from './types';

export const raToAz = (lst: number, ra: number): number => (lst - ra) % 360;

export const deToAlt = (lat: number, de: number): number => de + (90 - lat);

export const getRaOfObject = ({ ra_hr, ra_min }): number => hmsToDeg({ hour: Number(ra_hr), min: Number(ra_min) });

export const getDeOfObject = ({ dec_deg, dec_min }): number => dmsToDeg({ deg: Number(dec_deg), min: Number(dec_min) });

export const getEqCoordsOfObject = object => ({ ra: getRaOfObject(object), de: getDeOfObject(object) });

export const eqToAz = (lst: number, lat: number, { ra, de }: Eq): Az => ({
  az: raToAz(lst, ra),
  alt: deToAlt(lat, de)
});
