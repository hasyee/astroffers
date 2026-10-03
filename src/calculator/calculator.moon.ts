import { getMoonTimes, getMoonIllumination } from 'suncalc';
import type { Interval, Position, Timestamp } from './calculator.types';
import { radToDeg } from './calculator.units';
import { toNoon } from './calculator.time';
import { getIntersection } from './calculator.interval';

type Cross = { type: 'rise' | 'set'; time: Timestamp };

const getLowerHalfDayArcsOfMoon = ({ start, end }: Interval, { lat, lon }: Position): Interval[] => {
  const latDeg = radToDeg(lat);
  const lonDeg = radToDeg(lon);
  // both calls cover the local solar day of the given date, so together they span the whole night
  const { rise: riseDate1, set: setDate1, alwaysUp: alwaysUp1 } = getMoonTimes(new Date(toNoon(start)), latDeg, lonDeg);
  const { rise: riseDate2, set: setDate2 } = getMoonTimes(new Date(toNoon(end)), latDeg, lonDeg);
  const crosses = [
    riseDate1 ? { type: 'rise', time: riseDate1.getTime() } : null,
    setDate1 ? { type: 'set', time: setDate1.getTime() } : null,
    riseDate2 ? { type: 'rise', time: riseDate2.getTime() } : null,
    setDate2 ? { type: 'set', time: setDate2.getTime() } : null
  ]
    .filter((cross): cross is Cross => !!cross)
    .sort((a, b) => a.time - b.time);
  if (crosses.length === 0) return alwaysUp1 ? [] : [{ start: -Infinity, end: Infinity }];
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

export const getMoonPhase = (midnight: Timestamp) => {
  const { phase: moonPhase, fraction: moonIllumination } = getMoonIllumination(new Date(midnight));
  return { moonPhase, moonIllumination };
};
