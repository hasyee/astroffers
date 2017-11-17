import { Filter } from '../types';
import { Timestamp, Loc, Deg, Interval, NightInfo } from './types';
import { getNight } from './sun';
import { getMoonNight, getMoonPhase } from './moon';
import { getLocation, degToRad } from './units';
import { getIntersection } from './interval';
import { toMidnight } from './time';

export default ({ date, latitude, longitude, twilight }: Filter): NightInfo => {
  const location = getLocation(latitude, longitude);
  const night = getNight(date, location);
  const astroNight = getNight(date, location, degToRad(twilight));
  const moonNight = getMoonNight(night, location);
  const moonPhase = getMoonPhase(toMidnight(date));
  const moonlessNight = getIntersection(astroNight, moonNight);
  return {
    night,
    moonNight,
    astroNight,
    moonlessNight,
    moonPhase
  };
};
