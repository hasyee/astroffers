import SunCalc = require('suncalc');
import { Timestamp, Loc, Interval } from './types';
import { radToDeg } from './units';
import { toNoon, toNextDay } from './time';
import { getIntersection, isInInterval } from './interval';

const getMoonRiseAndSet = (time: Timestamp, { lat, lon }: Loc): { rise: Timestamp; set: Timestamp } => {
  const { rise: riseDate, set: setDate } = SunCalc.getMoonTimes(new Date(time), radToDeg(lat), radToDeg(lon));
  const rise = riseDate ? riseDate.getTime() : undefined;
  const set = setDate ? setDate.getTime() : undefined;
  return { rise, set };
};

export const getMoonNight = (night: Interval, loc: Loc): Interval => {
  const { rise: rise1, set: set1 } = getMoonRiseAndSet(night.start, loc);
  const { rise: rise2, set: set2 } = getMoonRiseAndSet(night.end, loc);
  if (isInInterval(night, rise1)) return { start: set1, end: rise1 };
  if (isInInterval(night, set1)) return { start: set1, end: rise2 };
  if (isInInterval(night, rise2)) return { start: set1, end: rise2 };
  if (isInInterval(night, set2)) return { start: set2, end: rise2 };
  if (set1 > rise1 && set1 < night.start && rise2 < set2 && rise2 > night.end) return { start: set1, end: rise2 };
  return null;
};

export const getMoonPhase = (midnight: Timestamp): number => {
  const { phase } = SunCalc.getMoonIllumination(new Date(midnight));
  return phase;
};
