import moment from 'moment';
import { Body, SearchAltitude, SearchRiseSet } from 'astronomy-engine';
import type { Observer } from 'astronomy-engine';
import type { Interval, Position, Radians, Timestamp } from './calculator.types';
import { getAltitude, searchTime, toObserver } from './calculator.astronomy';
import { radToDeg } from './calculator.units';
import { toNoon, toNextDay } from './calculator.time';

const MINUTE = 60 * 1000;

/** Geometric altitude of the center of the Sun at sunset and sunrise, when its upper limb touches the horizon */
const SUNSET_ALTITUDE = -0.833;

/**
 * The next time after `from`, within a day, when the Sun gets below (-1) or above (+1) the altitude: the horizon (0)
 * means the sunset and the sunrise (the upper limb with the refraction), others its center (e.g. the twilight)
 */
const searchSun = (observer: Observer, direction: -1 | 1, from: Timestamp, altitude: Radians) =>
  searchTime(
    (date, limit) =>
      altitude === 0
        ? SearchRiseSet(Body.Sun, observer, direction, date, limit)
        : SearchAltitude(Body.Sun, observer, direction, date, limit, radToDeg(altitude)),
    from,
    1
  );

const isSunAbove = (observer: Observer, time: Timestamp, altitude: Radians) =>
  getAltitude(Body.Sun, time, observer) > (altitude === 0 ? SUNSET_ALTITUDE : radToDeg(altitude));

/**
 * The (mean) solar noon of the date at the longitude, when the Sun is at its highest: not the noon of the time zone
 * of the device, which may be night at a location far from it
 */
const getSolarNoon = (date: Timestamp, { lon }: Position) => {
  const day = moment(date);
  return Date.UTC(day.year(), day.month(), day.date(), 12) - radToDeg(lon) * 4 * 60 * 1000;
};

/**
 * The night of the date: from the time the Sun gets below the altitude after the solar noon of the date till it gets
 * above it again. Without a sunset in a day (polar day) there is no night; without a sunrise (polar night) it is
 * open-ended (±Infinity), or the nominal night from noon to noon (for the bands of the calendar).
 */
export const getNight = (
  date: Timestamp,
  location: Position,
  minAltitude: Radians = 0,
  isNominalNight = false
): Interval | null => {
  const observer = toObserver(location);
  const noon = toNoon(date);
  const openStart = isNominalNight ? noon : -Infinity;
  const openEnd = isNominalNight ? toNextDay(noon) : Infinity;
  const solarNoon = getSolarNoon(date, location);
  // the Sun is up at its highest: the night starts by its setting, if it sets at all (not on a polar day)
  if (isSunAbove(observer, solarNoon, minAltitude)) {
    const set = searchSun(observer, -1, solarNoon, minAltitude);
    if (set === null) return null;
    // from a minute later: the search started at the crossing itself may find it again
    return { start: set, end: searchSun(observer, +1, set + MINUTE, minAltitude) ?? openEnd };
  }
  // it does not get above it (a polar night), the night lasts till it does
  return { start: openStart, end: searchSun(observer, +1, solarNoon, minAltitude) ?? openEnd };
};
