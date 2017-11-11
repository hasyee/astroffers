import SunCalc = require('suncalc');
import { Timestamp, Loc, Interval } from './types';
import { radToDeg } from './units';

export const getHalfDayArcOfMoon = (time: Timestamp, { lat, lon }: Loc): Interval => {
  const { rise: riseDate, set: setDate } = SunCalc.getMoonTimes(new Date(time), radToDeg(lat), radToDeg(lon));
  const start = riseDate.getTime();
  const end = setDate.getTime();
  return { start, end };
};
