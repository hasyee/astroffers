import { Deg, Rad, Hour, Hms, Dms } from './types';

export const PI2 = 2 * Math.PI;

export const degToRad = (deg: Deg): Rad => deg / 360 * PI2;

export const radToDeg = (rad: Rad): Deg => rad / PI2 * 360;

export const normalizeRad = (rad: Rad) => {
  const r = rad % PI2;
  return r < 0 ? r + PI2 : r;
};

export const radToHours = (rad: Rad): Hour => normalizeRad(rad) / PI2 * 24;

export const hmsToRad = ({ hour = 0, min = 0, sec = 0 }: Hms): Rad => (hour + (min + sec / 60) / 60) / 24 * PI2;

export const dmsToRad = ({ deg = 0, min = 0, sec = 0 }: Dms): Rad => degToRad(deg + (min + sec / 60) / 60);

export const radToHms = (rad: Rad): Hms => {
  const hourWithDecimals = radToHours(rad);
  const hour = Math.floor(hourWithDecimals);
  const minWithDecimals = (hourWithDecimals - hour) * 60;
  const min = Math.floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = Math.floor(secWithDecimals);
  return { hour, min, sec };
};

export const radToDms = (rad: Rad): Dms => {
  const degWithDecimals = radToDeg(rad);
  const deg = Math.floor(degWithDecimals);
  const minWithDecimals = (degWithDecimals - deg) * 60;
  const min = Math.floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = Math.floor(secWithDecimals);
  return { deg, min, sec };
};

/* export const degToHours = (deg: number): number => (deg % 360) / 360 * 24; */

/* export const hmsToDeg = ({ hour = 0, min = 0, sec = 0 }: Hms): number => (hour + (min + sec / 60) / 60) / 24 * 360; */

/* export const dmsToDeg = ({ deg = 0, min = 0, sec = 0 }: Dms): number => deg + (min + sec / 60) / 60; */

/* export const degToHms = (deg: number): Hms => {
  const hourWithDecimals = degToHours(deg < 0 ? 360 + deg : deg);
  const hour = Math.floor(hourWithDecimals);
  const minWithDecimals = (hourWithDecimals - hour) * 60;
  const min = Math.floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = Math.floor(secWithDecimals);
  return { hour, min, sec };
}; */

/* export const degToDms = (degWithDecimals: number): Dms => {
  const deg = Math.floor(degWithDecimals);
  const minWithDecimals = (degWithDecimals - deg) * 60;
  const min = Math.floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = Math.floor(secWithDecimals);
  return { deg, min, sec };
}; */
