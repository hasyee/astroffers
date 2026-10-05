import moment from 'moment';
import { Body, Illumination, MoonPhase, SearchRiseSet } from 'astronomy-engine';
import type { Observer } from 'astronomy-engine';
import type { Interval, Position, Timestamp } from './calculator.types';
import { getAltitude, searchTime, toObserver } from './calculator.astronomy';
import { getIntersection } from './calculator.interval';

type Cross = { type: 'rise' | 'set'; time: Timestamp };

const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;

/** The next moonrise (+1) or moonset (-1) after `from` till `to` */
const searchMoon = (observer: Observer, direction: -1 | 1, from: Timestamp, to: Timestamp) =>
  searchTime((date, limit) => SearchRiseSet(Body.Moon, observer, direction, date, limit), from, (to - from) / DAY);

/** The moonrises and moonsets of the days of the interval, in order */
const getCrosses = (observer: Observer, from: Timestamp, to: Timestamp): Cross[] => {
  const crosses: Cross[] = [];
  let rise = searchMoon(observer, +1, from, to);
  let set = searchMoon(observer, -1, from, to);
  while (rise !== null || set !== null) {
    if (set === null || (rise !== null && rise < set)) {
      crosses.push({ type: 'rise', time: rise! });
      rise = searchMoon(observer, +1, rise! + MINUTE, to);
    } else {
      crosses.push({ type: 'set', time: set });
      set = searchMoon(observer, -1, set + MINUTE, to);
    }
  }
  return crosses;
};

/** The times the Moon is below the horizon, from the start of the day of the night's start to the end of its end */
const getLowerHalfDayArcsOfMoon = ({ start, end }: Interval, location: Position): Interval[] => {
  const observer = toObserver(location);
  const from = moment(start).startOf('day').valueOf();
  const crosses = getCrosses(observer, from, moment(end).endOf('day').valueOf());
  if (crosses.length === 0) return getAltitude(Body.Moon, from, observer) > 0 ? [] : [{ start: -Infinity, end: Infinity }];
  return crosses.reduce<Interval[]>((halfDayArcs, cross) => {
    if (cross.type === 'set') return [...halfDayArcs, { start: cross.time, end: Infinity }];
    else {
      if (halfDayArcs.length === 0) return [{ start: -Infinity, end: cross.time }];
      else {
        return halfDayArcs.map((halfDayArc, i) =>
          i === halfDayArcs.length - 1 ? { ...halfDayArc, end: cross.time } : halfDayArc
        );
      }
    }
  }, []);
};

export const getMoonNight = (interval: Interval | null, loc: Position): Interval | null => {
  if (!interval) return null;
  const lowerHalfDayArcsOfMoon = getLowerHalfDayArcsOfMoon(interval, loc);
  return lowerHalfDayArcsOfMoon.find(halfDayArc => !!getIntersection(interval, halfDayArc)) || null;
};

/** The phase (0: new, 0.25: first quarter, 0.5: full, 0.75: last quarter) and the illuminated fraction of the Moon */
export const getMoonPhase = (midnight: Timestamp) => {
  const date = new Date(midnight);
  return { moonPhase: MoonPhase(date) / 360, moonIllumination: Illumination(Body.Moon, date).phase_fraction };
};
