import { Hms, Dms } from './types';

export const degToHours = (deg: number): number => deg / 360 * 24;

export const degToHms = (deg: number): Hms => {
  const hourWithDecimals = degToHours(deg < 0 ? 360 + deg : deg);
  const hour = Math.floor(hourWithDecimals);
  const minWithDecimals = (hourWithDecimals - hour) * 60;
  const min = Math.floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = Math.floor(secWithDecimals);
  return { hour, min, sec };
};

export const hmsToDeg = ({ hour = 0, min = 0, sec = 0 }: Hms): number => (hour + (min + sec / 60) / 60) / 24 * 360;

export const degToDms = (degWithDecimals: number): Dms => {
  const deg = Math.floor(degWithDecimals);
  const minWithDecimals = (degWithDecimals - deg) * 60;
  const min = Math.floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = Math.floor(secWithDecimals);
  return { deg, min, sec };
};

export const dmsToDeg = ({ deg = 0, min = 0, sec = 0 }: Dms): number => deg + (min + sec / 60) / 60;
