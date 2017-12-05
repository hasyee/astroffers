import SunCalc = require('suncalc');
import { Timestamp, Loc, Interval } from './types';
import { radToDeg } from './units';
import { toNoon, toNextDay } from './time';
import { getIntersection, isInInterval } from './interval';

const getMoonRiseAndSet = (time: Timestamp, { lat, lon }: Loc): { rise: Timestamp; set: Timestamp } => {
  const { rise: riseDate, set: setDate, alwaysUp, alwaysDown } = SunCalc.getMoonTimes(
    new Date(time),
    radToDeg(lat),
    radToDeg(lon)
  );
  console.log(new Date(time), radToDeg(lat), radToDeg(lon), 'alwaysUp', alwaysUp, 'alwaysDown', alwaysDown);
  if (alwaysUp) return { rise: -Infinity, set: Infinity };
  if (alwaysDown) return { rise: undefined, set: undefined };
  const rise = riseDate ? riseDate.getTime() : undefined;
  const set = setDate ? setDate.getTime() : undefined;
  return { rise, set };
};

export const getMoonNight = (date: Timestamp, night: Interval, loc: Loc): Interval => {
  if (!night) return null;
  const { rise: rise1, set: set1 } = getMoonRiseAndSet(toNoon(date), loc);
  const { rise: rise2, set: set2 } = getMoonRiseAndSet(toNoon(toNextDay(date)), loc);
  if (isInInterval(night, rise1)) return { start: set1, end: rise1 };
  if (isInInterval(night, set1)) return { start: set1, end: rise2 };
  if (isInInterval(night, rise2)) return { start: set1, end: rise2 };
  if (isInInterval(night, set2)) return { start: set2, end: rise2 };
  if (set1 > rise1 && set1 < night.start && rise2 < set2 && rise2 > night.end) return { start: set1, end: rise2 };
  if (set1 < rise1) console.log(rise1, set1, rise2, set2);
  return null;
};

export const getMoonPhase = (midnight: Timestamp): number => {
  const { phase } = SunCalc.getMoonIllumination(new Date(midnight));
  return phase;
};
