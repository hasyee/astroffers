import SunCalc = require('suncalc');
import { Timestamp, Loc, Interval } from './types';
import { radToDeg } from './units';
import { toNoon, toNextDay } from './time';
import { getIntersection, isInInterval } from './interval';

const getLowerHalfDayArcsOfMoon = (date: Timestamp, { lat, lon }: Loc): Interval[] => {
  //console.log('DATE:', new Date(date));
  const latDeg = radToDeg(lat);
  const lonDeg = radToDeg(lon);
  const { rise: riseDate1, set: setDate1, alwaysUp: alwaysUp1, alwaysDown: alwaysDown1 } = SunCalc.getMoonTimes(
    toNoon(date),
    latDeg,
    lonDeg,
    true
  );
  const { rise: riseDate2, set: setDate2, alwaysUp: alwaysUp2, alwaysDown: alwaysDown2 } = SunCalc.getMoonTimes(
    toNoon(toNextDay(date)),
    latDeg,
    lonDeg,
    true
  );
  //console.log(alwaysUp1, alwaysDown1, alwaysUp2, alwaysDown2, riseDate1, setDate1, riseDate2, setDate2);
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

export const getMoonNight = (date: Timestamp, night: Interval, loc: Loc): Interval => {
  const lowerHalfDayArcsOfMoon = getLowerHalfDayArcsOfMoon(date, loc);
  //console.log(lowerHalfDayArcsOfMoon.map(i => ({ start: new Date(i.start), end: new Date(i.end) })));
  return lowerHalfDayArcsOfMoon.find(halfDayArc => !!getIntersection(night, halfDayArc)) || null;
};

/* const getMoonRiseAndSet = (time: Timestamp, { lat, lon }: Loc): { rise: Timestamp; set: Timestamp } => {
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
}; */

export const getMoonPhase = (midnight: Timestamp): number => {
  const { phase } = SunCalc.getMoonIllumination(new Date(midnight));
  return phase;
};
