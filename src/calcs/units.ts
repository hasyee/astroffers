import { Deg, Rad, Hour, Hms, Dms, ArcMin, ArcSec, Timestamp, Day, Year, Century, Interval, Loc } from './types';
import leftpad = require('left-pad');

const { round, floor, ceil, abs, PI } = Math;

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

export const fix = (value: number) => leftpad(round(abs(value)), 2, 0);

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

export const radToArcSec = (rad: Rad): ArcSec => (rad % PI2) / PI2 * COMPLETE_ARC_SECS;

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

export const hmsToString = ({ hour, min, sec }: Hms): string => `${fix(hour)}h ${fix(min)}m ${fix(sec)}s`;

export const dmsToString = ({ deg, arcMin, arcSec }: Dms): string => {
  const isNegative = [ deg, arcMin, arcSec ].some(value => value < 0);
  return `${isNegative ? '-' : ''}${fix(deg)}° ${fix(arcMin)}' ${fix(arcSec)}"`;
};

export const radToHmsString = (rad: Rad): string => hmsToString(radToHms(rad));

export const radToDmsString = (rad: Rad): string => dmsToString(radToDms(rad));

export const timeToJulianDate = (time: Timestamp): Day => time / MILLISECONDS_OF_DAY + JULIAND_DATE_OF_UTC_EPOCH;

export const julianDateToTime = (julianDate: Day): Timestamp =>
  (julianDate - JULIAND_DATE_OF_UTC_EPOCH) * MILLISECONDS_OF_DAY;

export const julianDateToEpochDayNumber = (julianDate: Day): Day => julianDate - JULIAN_DATE_OF_MILLENIUM;

export const epochDayNumberToJulanDate = (epochDayNumber: Day): Day => epochDayNumber + JULIAN_DATE_OF_MILLENIUM;

export const timeToEpochDayNumber = (time: Timestamp): Day => julianDateToEpochDayNumber(timeToJulianDate(time));

export const epochDayNumberToTime = (epochDayNumber: Day): Timestamp =>
  epochDayNumberToJulanDate(julianDateToTime(epochDayNumber));

export const halfDayArcToString = ({ start, end }: Interval) =>
  `RISE: ${new Date(start).toLocaleString()} SET: ${new Date(end).toLocaleString()}`;

export const getLocation = (latitude: Deg, longitude: Deg): Loc => ({
  lat: degToRad(latitude),
  lon: degToRad(longitude)
});
