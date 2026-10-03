import type { Az, CoordSeries, Eq, Position, Timestamp } from './calculator.types';
import { PI2 } from './calculator.units';
import { timeToLst } from './calculator.lst';
import { toNextDay, toNoon } from './calculator.time';

const { sin, cos, atan2, asin } = Math;

const MINUTE = 60 * 1000;

export const eqToAz = (time: Timestamp, { lat, lon }: Position, { ra, de }: Eq): Az => {
  const h = timeToLst(time, lon) - ra;
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

/** Horizontal coordinates of an object minute by minute, from the noon of the date to the next noon */
export const getHorizontalCoordSeries = (date: Timestamp, location: Position, eq: Eq): CoordSeries<Az> => {
  const noon = toNoon(date);
  const length = (toNextDay(noon) - noon) / MINUTE;
  return Array.from({ length }, (_, i) => {
    const time = noon + i * MINUTE;
    return { time, coord: eqToAz(time, location, eq) };
  });
};
