import moment from 'moment';
import { Body, Illumination, MoonPhase, SearchRiseSet } from 'astronomy-engine';
import type { Observer } from 'astronomy-engine';
import type { Interval, MoonCross, Position, Timestamp } from './calculator.types';
import { getAltitude, searchTime, toObserver } from './calculator.astronomy';
import { getIntersection } from './calculator.interval';
import { toNextDay, toNoon } from './calculator.time';

const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;

/** The next moonrise (+1) or moonset (-1) after `from` till `to` */
const searchMoon = (observer: Observer, direction: -1 | 1, from: Timestamp, to: Timestamp) =>
  searchTime((date, limit) => SearchRiseSet(Body.Moon, observer, direction, date, limit), from, (to - from) / DAY);

/** The moonrises and moonsets of the days of the interval, in order */
const getCrosses = (observer: Observer, from: Timestamp, to: Timestamp): MoonCross[] => {
  const crosses: MoonCross[] = [];
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

/** The times the Moon is below the horizon by its crosses; without any, all or none of the time by `isDown` */
const getLowerHalfDayArcsOfMoon = (crosses: MoonCross[], isDown: () => boolean): Interval[] => {
  if (crosses.length === 0) return isDown() ? [{ start: -Infinity, end: Infinity }] : [];
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

/**
 * The moonrises and moonsets from the noon to the next noon; a single one with the other one beside it: the moonset
 * before the noon, or the moonrise after the next noon (none for a Moon up or down for days, at a polar location)
 */
const getDayCrosses = (crosses: MoonCross[], noon: Timestamp, nextNoon: Timestamp): MoonCross[] => {
  const dayCrosses = crosses.filter(({ time }) => time >= noon && time < nextNoon);
  if (dayCrosses.length !== 1) return dayCrosses;
  const [cross] = dayCrosses;
  const neighbour =
    cross.type === 'rise' ? crosses.findLast(({ time }) => time < noon) : crosses.find(({ time }) => time >= nextNoon);
  if (!neighbour) return dayCrosses;
  return cross.type === 'rise' ? [neighbour, cross] : [cross, neighbour];
};

/**
 * The moonrises and moonsets of the day of the clock face (from the noon of the date to the next noon, see
 * `getDayCrosses`), and the moonless part of the astronomical night: its first time below the horizon in it. The
 * crosses are searched from the start of the day of the noon, or of the night's start if earlier, to the end of the
 * day of the next noon, or of the night's end if later (the night of a far location may reach beyond the noons of the
 * device's time zone).
 */
export const getMoonTimes = (date: Timestamp, astroNight: Interval | null, loc: Position) => {
  const observer = toObserver(loc);
  const noon = toNoon(date);
  const nextNoon = toNoon(toNextDay(date));
  const from = moment(Math.min(noon, astroNight?.start ?? noon))
    .startOf('day')
    .valueOf();
  const to = moment(Math.max(nextNoon, astroNight?.end ?? nextNoon))
    .endOf('day')
    .valueOf();
  const crosses = getCrosses(observer, from, to);
  const moonCrosses = getDayCrosses(crosses, noon, nextNoon);
  if (!astroNight) return { moonCrosses, moonlessNight: null };
  const lowerHalfDayArcs = getLowerHalfDayArcsOfMoon(crosses, () => getAltitude(Body.Moon, from, observer) <= 0);
  const moonNight = lowerHalfDayArcs.find(halfDayArc => !!getIntersection(astroNight, halfDayArc)) ?? null;
  return { moonCrosses, moonlessNight: getIntersection(astroNight, moonNight) };
};

/** The phase (0: new, 0.25: first quarter, 0.5: full, 0.75: last quarter) and the illuminated fraction of the Moon */
export const getMoonPhase = (midnight: Timestamp) => {
  const date = new Date(midnight);
  return { moonPhase: MoonPhase(date) / 360, moonIllumination: Illumination(Body.Moon, date).phase_fraction };
};
