import type { Degrees, Interval, Position, Radians, Timestamp } from './calculator.types';

export type Hms = { hour: number; min: number; sec: number };
export type Dms = { deg: number; arcMin: number; arcSec: number };

const { round, floor, abs, PI } = Math;

export const PI2 = 2 * PI;
export const COMPLETE_ARC_SECS = 1296000;
export const MILLISECONDS_OF_DAY = 86400000;
export const JULIAND_DATE_OF_UTC_EPOCH = 2440587.5;
export const JULIAN_DATE_OF_MILLENIUM = 2451545;

export const roundTo = (decimals: number) => {
  const precision = 10 ** decimals;
  return (value: number) => round(value * precision) / precision;
};

export const roundTo2 = roundTo(2);

export const fix = (value: number) => String(round(abs(value))).padStart(2, '0');

export const getSign = (value: number) => (value < 0 ? -1 : +1);

export const unSignedFloor = (value: number) => getSign(value) * floor(abs(value));

export const degToRad = (deg: Degrees): Radians => (deg / 360) * PI2;

export const radToDeg = (rad: Radians): Degrees => (rad / PI2) * 360;

export const normalizeRad = (rad: Radians): Radians => {
  const r = rad % PI2;
  return r < 0 ? r + PI2 : r;
};

export const radToHours = (rad: Radians) => (normalizeRad(rad) / PI2) * 24;

export const hoursToRad = (hours: number): Radians => (hours / 24) * PI2;

export const hmsToRad = ({ hour = 0, min = 0, sec = 0 }: Partial<Hms>): Radians =>
  ((hour + min / 60 + sec / 3600) / 24) * PI2;

export const dmsToRad = ({ deg = 0, arcMin = 0, arcSec = 0 }: Partial<Dms>): Radians =>
  degToRad(deg + arcMin / 60 + arcSec / 3600);

export const radToArcSec = (rad: Radians) => ((rad % PI2) / PI2) * COMPLETE_ARC_SECS;

export const radToHms = (rad: Radians): Hms => {
  const hourWithDecimals = radToHours(rad);
  const hour = floor(hourWithDecimals);
  const minWithDecimals = (hourWithDecimals - hour) * 60;
  const min = floor(minWithDecimals);
  const secWithDecimals = (minWithDecimals - min) * 60;
  const sec = roundTo2(secWithDecimals);
  return { hour, min, sec };
};

export const radToDms = (rad: Radians): Dms => {
  const arcSecs = radToArcSec(rad);
  const arcMins = unSignedFloor(arcSecs / 60);
  const arcSec = roundTo2(arcSecs - arcMins * 60);
  const deg = unSignedFloor(arcMins / 60);
  const arcMin = round(arcMins - deg * 60);
  return { deg, arcMin, arcSec };
};

export const hmsToString = ({ hour, min, sec }: Hms) => `${fix(hour)}h ${fix(min)}m ${fix(sec)}s`;

export const dmsToString = ({ deg, arcMin, arcSec }: Dms) => {
  const isNegative = [deg, arcMin, arcSec].some(value => value < 0);
  return `${isNegative ? '-' : ''}${fix(deg)}° ${fix(arcMin)}' ${fix(arcSec)}"`;
};

export const radToHmsString = (rad: Radians) => hmsToString(radToHms(rad));

export const radToDmsString = (rad: Radians) => dmsToString(radToDms(rad));

export const timeToJulianDate = (time: Timestamp) => time / MILLISECONDS_OF_DAY + JULIAND_DATE_OF_UTC_EPOCH;

export const julianDateToTime = (julianDate: number): Timestamp =>
  (julianDate - JULIAND_DATE_OF_UTC_EPOCH) * MILLISECONDS_OF_DAY;

export const julianDateToEpochDayNumber = (julianDate: number) => julianDate - JULIAN_DATE_OF_MILLENIUM;

export const epochDayNumberToJulanDate = (epochDayNumber: number) => epochDayNumber + JULIAN_DATE_OF_MILLENIUM;

export const timeToEpochDayNumber = (time: Timestamp) => julianDateToEpochDayNumber(timeToJulianDate(time));

export const epochDayNumberToTime = (epochDayNumber: number) =>
  epochDayNumberToJulanDate(julianDateToTime(epochDayNumber));

export const halfDayArcToString = ({ start, end }: Interval) =>
  `RISE: ${new Date(start).toLocaleString()} SET: ${new Date(end).toLocaleString()}`;

export const getLocation = (latitude: Degrees, longitude: Degrees): Position => ({
  lat: degToRad(latitude),
  lon: degToRad(longitude)
});
