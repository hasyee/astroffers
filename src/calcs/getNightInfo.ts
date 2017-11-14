import { Filter } from '../types';
import { Timestamp, Loc, Deg, Interval, NightInfo } from './types';
import { getNight } from './sun';
import { getMoonNight } from './moon';
import { getLocation, degToRad } from './units';
import { getIntersection } from './interval';

export default ({ date, latitude, longitude, twilight }: Filter) => {
  const location = getLocation(latitude, longitude);
  const night = getNight(date, location);
  const astroNight = getNight(date, location, degToRad(twilight));
  const moonNight = getMoonNight(night, location);
  const moonlessNight = getIntersection(astroNight, moonNight);
  return {
    night,
    moonNight,
    astroNight,
    moonlessNight
  };
};