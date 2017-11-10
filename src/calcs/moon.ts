import SunCalc = require('suncalc');
import { Timestamp, Loc, HalfDayArc } from './types';
import { radToDeg } from './units';

export const getHalfDayArcOfMoon = (time: Timestamp, { lat, lon }: Loc): HalfDayArc => {
  const { rise: riseDate, set: setDate } = SunCalc.getMoonTimes(new Date(time), radToDeg(lat), radToDeg(lon));
  const rise = riseDate.getTime();
  const set = setDate.getTime();
  const noon = Math.round((rise + set) / 2);
  return { rise, noon, set };
};
