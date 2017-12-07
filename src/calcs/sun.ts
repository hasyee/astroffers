/**
 * SOURCE: https://en.wikipedia.org/wiki/Position_of_the_Sun
 * AND: http://www.jgiesen.de/astro/suncalc/calculations.htm
 * CALCULATOR: http://www.jgiesen.de/astro/suncalc/
 */

import moment = require('moment');
import { Timestamp, Interval, Loc, Ecl, Rad, Transit, TransitType } from './types';
import {
  PI2,
  timeToEpochDayNumber,
  julianDateToTime,
  degToRad,
  JULIAN_DATE_OF_MILLENIUM,
  radToDms,
  radToHms,
  radToHmsString,
  radToDmsString,
  radToDeg
} from './units';
import { lstToTime, timeToLst } from './lst';
import { eclToEq } from './coords';
import { toNoon, toNextDay } from './time';
import { flatten } from './utils';

const { PI, sin, cos, asin, acos, tan, round } = Math;

const getFractionalYear = (time: Timestamp): number => {
  const dayOfYear = moment(time).dayOfYear();
  return (dayOfYear - 1) * PI2 / 365;
};

const getEqTime = (y: number): Rad =>
  229.18 * (0.000075 + 0.001868 * cos(y) - 0.032077 * sin(y) - 0.014615 * cos(2 * y) - 0.040849 * sin(2 * y));

const getDeclination = (y: number): Rad =>
  0.006918 -
  0.399912 * cos(y) +
  0.070257 * sin(y) -
  0.006758 * cos(2 * y) +
  0.000907 * sin(2 * y) -
  0.002697 * cos(3 * y) +
  0.00148 * sin(3 * y);

const getAltitude = (de: Rad, { lat, lon }: Loc, eqTime: number, time: Timestamp): Rad => {
  const date = new Date(time);
  const timeOffset = eqTime - 4 * radToDeg(lon) + date.getTimezoneOffset();
  const tst = date.getHours() * 60 + date.getMinutes() + timeOffset;
  const ha = degToRad(tst / 4 - 180);
  return asin(sin(lat) * sin(de) + cos(lat) * cos(de) * cos(ha));
};

export const getEclipticCoords = (time: Timestamp): Ecl => {
  const julianDayNumber = timeToEpochDayNumber(time);
  const meanLongitude = degToRad(280.46) + degToRad(0.985674) * julianDayNumber;
  const meanAnomaly = degToRad(357.528) + degToRad(0.9856003) * julianDayNumber;
  return {
    lon: meanLongitude + degToRad(1.915) * sin(meanAnomaly) + degToRad(0.02) * sin(2 * meanAnomaly),
    lat: 0
  };
};

export const getHalfDayArcOfSun = (time: Timestamp, { lat, lon }: Loc, minAltitude: Rad = 0): Interval => {
  const y = getFractionalYear(time);
  const eqTime = getEqTime(y);
  const de = getDeclination(y);
  const ha = acos((sin(minAltitude) - sin(lat) * sin(de)) / (cos(lat) * cos(de)));
  if (!Number.isFinite(ha)) {
    return getAltitude(de, { lat, lon }, eqTime, time) > 0 ? { start: -Infinity, end: Infinity } : null;
  }
  const riseMins = 720 + 4 * radToDeg(-lon - ha) - eqTime;
  const setMins = 720 + 4 * radToDeg(-lon + ha) - eqTime;
  const start = moment.utc(time).startOf('day').add(riseMins, 'minutes').valueOf();
  const end = moment.utc(time).startOf('day').add(setMins, 'minutes').valueOf();
  return { start, end };
};

export const getNight = (date: Timestamp, loc: Loc, minAltitude: Rad = 0, isNominalNight: boolean = false): Interval => {
  const noon = toNoon(date);
  const nextDayNoon = toNextDay(noon);
  const thatDayArc = getHalfDayArcOfSun(noon, loc, minAltitude);
  const nextDayArc = getHalfDayArcOfSun(nextDayNoon, loc, minAltitude);
  if (!thatDayArc || !nextDayArc)
    return { start: isNominalNight ? noon : -Infinity, end: isNominalNight ? nextDayNoon : Infinity };
  if (thatDayArc.end === Infinity && nextDayArc.start === -Infinity) return null;
  return {
    start: thatDayArc.end,
    end: nextDayArc.start
  };
};
