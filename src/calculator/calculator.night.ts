import type { Degrees, NightInfo, Timestamp } from './calculator.types';
import { getNight } from './calculator.sun';
import { getMoonNight, getMoonPhase } from './calculator.moon';
import { getLocation, degToRad } from './calculator.units';
import { getIntersection } from './calculator.interval';
import { toMidnight } from './calculator.time';

export const getNightInfo = (date: Timestamp, latitude: Degrees, longitude: Degrees, twilight: Degrees): NightInfo => {
  const location = getLocation(latitude, longitude);
  const night = getNight(date, location);
  const astroNight = night ? getNight(date, location, degToRad(twilight), true) : null;
  const moonNight = getMoonNight(astroNight, location);
  const { moonPhase, moonIllumination } = getMoonPhase(toMidnight(date));
  const moonlessNight = getIntersection(astroNight, moonNight);
  return {
    night,
    moonNight,
    astroNight,
    moonlessNight,
    moonPhase,
    moonIllumination
  };
};
