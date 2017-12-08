import SunCalc = require('suncalc');
import { Timestamp, Loc, Interval } from './types';
import { radToDeg } from './units';
import { getIntersection, isInInterval } from './interval';

const getLowerHalfDayArcsOfMoon = ({ start, end }: Interval, { lat, lon }: Loc): Interval[] => {
  const latDeg = radToDeg(lat);
  const lonDeg = radToDeg(lon);
  const { rise: riseDate1, set: setDate1, alwaysUp: alwaysUp1, alwaysDown: alwaysDown1 } = SunCalc.getMoonTimes(
    start,
    latDeg,
    lonDeg,
    true
  );
  const { rise: riseDate2, set: setDate2, alwaysUp: alwaysUp2, alwaysDown: alwaysDown2 } = SunCalc.getMoonTimes(
    end,
    latDeg,
    lonDeg,
    true
  );
  const crosses = [
    riseDate1 ? { type: 'rise', time: riseDate1.getTime() } : null,
    setDate1 ? { type: 'set', time: setDate1.getTime() } : null,
    riseDate2 ? { type: 'rise', time: riseDate2.getTime() } : null,
    setDate2 ? { type: 'set', time: setDate2.getTime() } : null
  ]
    .filter(_ => _)
    .sort((a, b) => a.time - b.time);
  if (crosses.length === 0) return alwaysUp1 ? [] : [ { start: -Infinity, end: Infinity } ];
  return crosses.reduce((halfDayArcs, cross, i) => {
    if (cross.type === 'set') return [ ...halfDayArcs, { start: cross.time, end: Infinity } ];
    else {
      if (halfDayArcs.length === 0) return [ { start: -Infinity, end: cross.time } ];
      else {
        return halfDayArcs.map(
          (halfDayArc, i) => (i === halfDayArcs.length - 1 ? { ...halfDayArc, end: cross.time } : halfDayArc)
        );
      }
    }
  }, []);
};

export const getMoonNight = (interval: Interval, loc: Loc): Interval => {
  if (!interval) return null;
  const lowerHalfDayArcsOfMoon = getLowerHalfDayArcsOfMoon(interval, loc);
  return lowerHalfDayArcsOfMoon.find(halfDayArc => !!getIntersection(interval, halfDayArc)) || null;
};

export const getMoonPhase = (midnight: Timestamp): number => {
  const { phase } = SunCalc.getMoonIllumination(new Date(midnight));
  return phase;
};
