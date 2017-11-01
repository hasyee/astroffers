import { Deg, Rad, Hour, Hms, Dms, ArcMin, ArcSec } from './types';

const { round, floor, ceil, abs, PI } = Math;

export const PI2 = 2 * PI;

export const ARC_SECS = 1296000;

export const roundTo = (decimals: number) => (value: number) => round(value * 100) / 100;

export const roundTo2 = roundTo(2);

export const getSign = (value: number) => (value < 0 ? -1 : +1);

export const unSignedFloor = (value: number): number => getSign(value) * floor(abs(value));

export const degToRad = (deg: Deg): Rad => deg / 360 * PI2;

export const radToDeg = (rad: Rad): Deg => rad / PI2 * 360;

export const normalizeRad = (rad: Rad) => {
  const r = rad % PI2;
  return r < 0 ? r + PI2 : r;
};

export const radToHours = (rad: Rad): Hour => normalizeRad(rad) / PI2 * 24;

export const hoursToRad = (hours: Hour): Rad => hours / 24 * PI2;

export const hmsToRad = ({ hour = 0, min = 0, sec = 0 }: Hms): Rad => (hour + min / 60 + sec / 3600) / 24 * PI2;

export const dmsToRad = ({ deg = 0, arcMin = 0, arcSec = 0 }: Dms): Rad => degToRad(deg + arcMin / 60 + arcSec / 3600);

export const radToArcSec = (rad: Rad): ArcSec => (rad % PI2) / PI2 * ARC_SECS;

export const radToHms = (rad: Rad): Hms => {
  const hourWithDecimals = radToHours(rad);
  const hour = floor(hourWithDecimals);
  const minWithDecimals = (hourWithDecimals - hour) * 60;
  const min = floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = roundTo2(secWithDecimals);
  return { hour, min, sec };
};

export const radToDms = (rad: Rad): Dms => {
  const arcSecs = radToArcSec(rad);
  const arcMins = unSignedFloor(arcSecs / 60);
  const arcSec = roundTo2(arcSecs - arcMins * 60);
  const deg = unSignedFloor(arcMins / 60);
  const arcMin = round(arcMins - deg * 60);
  return { deg, arcMin, arcSec };
};

export const hmsToString = ({ hour, min, sec }: Hms): string => `${hour}h ${min}m ${sec}s`;

export const dmsToString = ({ deg, arcMin, arcSec }: Dms): string => {
  const isNegative = [ deg, arcMin, arcSec ].some(value => value < 0);
  return `${isNegative ? '-' : ''}${abs(deg)}° ${abs(arcMin)}' ${abs(arcSec)}"`;
};

export const radToHmsString = (rad: Rad): string => hmsToString(radToHms(rad));

export const radToDmsString = (rad: Rad): string => dmsToString(radToDms(rad));
