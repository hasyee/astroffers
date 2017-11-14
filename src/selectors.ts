import { Timestamp, Loc, Deg, Interval, NightInfo } from './calcs/types';
import { getNight } from './calcs/sun';
import { getMoonNight } from './calcs/moon';
import { getLocation, degToRad } from './calcs/units';
import { getIntersection } from './calcs/interval';

export const getNightInfo = ({ filter: { date, latitude, longitude, twilight } }) => {
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
