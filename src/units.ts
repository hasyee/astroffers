import { Deg, Rad, Hour, Hms, Dms } from './types';

const { floor, ceil, abs, PI } = Math;

export const PI2 = 2 * PI;

export const round = (decimals: number) => (value: number) => Math.round(value * 100) / 100;

export const round2 = round(2);

export const degToRad = (deg: Deg): Rad => deg / 360 * PI2;

export const radToDeg = (rad: Rad): Deg => rad / PI2 * 360;

export const normalizeRad = (rad: Rad) => {
  const r = rad % PI2;
  return r < 0 ? r + PI2 : r;
};

export const radToHours = (rad: Rad): Hour => normalizeRad(rad) / PI2 * 24;

export const hoursToRad = (hours: Hour): Rad => hours / 24 * PI2;

export const hmsToRad = ({ hour = 0, min = 0, sec = 0 }: Hms): Rad => (hour + min / 60 + sec / 3600) / 24 * PI2;

export const dmsToRad = ({ deg = 0, arcMin = 0, arcSec = 0 }: Dms): Rad =>
  (deg < 0 ? -1 : +1) * degToRad(abs(deg) + arcMin / 60 + arcSec / 3600);

export const radToHms = (rad: Rad): Hms => {
  const hourWithDecimals = radToHours(rad);
  const hour = floor(hourWithDecimals);
  const minWithDecimals = (hourWithDecimals - hour) * 60;
  const min = floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = round2(secWithDecimals);
  return { hour, min, sec };
};

export const radToDms = (rad: Rad): Dms => {
  const degWithDecimals = radToDeg(rad);
  const deg = (degWithDecimals >= 0 ? floor : ceil)(degWithDecimals);
  const arcMinWithDecimals = (abs(degWithDecimals) - abs(deg)) * 60;
  const arcMin = floor(arcMinWithDecimals);
  const arcSecWithDecimals = (arcMinWithDecimals - arcMin) * 60;
  const arcSec = round2(arcSecWithDecimals);
  return { deg, arcMin, arcSec };
};

export const radToHmsString = (rad: Rad): string => {
  const { hour, min, sec } = radToHms(rad);
  return `${hour}h ${min}m ${sec}s`;
};

export const radToDmsString = (rad: Rad): string => {
  const { deg, arcMin, arcSec } = radToDms(rad);
  return `${deg}° ${arcMin}' ${arcSec}"`;
};
