import type { Degrees, NightInfo, Timestamp } from './calculator.types';
import { getNight } from './calculator.sun';
import { getMoonPhase, getMoonTimes } from './calculator.moon';
import { getLocation, degToRad } from './calculator.units';
import { toMidnight } from './calculator.time';

export const getNightInfo = (date: Timestamp, latitude: Degrees, longitude: Degrees, twilight: Degrees): NightInfo => {
  const location = getLocation(latitude, longitude);
  const night = getNight(date, location);
  const astroNight = night ? getNight(date, location, degToRad(twilight), true) : null;
  const { moonCrosses, moonlessNight } = getMoonTimes(date, astroNight, location);
  const { moonPhase, moonIllumination } = getMoonPhase(toMidnight(date));
  return {
    night,
    astroNight,
    moonlessNight,
    moonCrosses,
    moonPhase,
    moonIllumination
  };
};
