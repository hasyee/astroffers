import { Timestamp, HalfDayArc, Loc } from './types';
import { PI2, timeToEpochDayNumber, julianDateToTime, degToRad, JULIAN_DATE_OF_MILLENIUM } from './units';

const { PI, sin, cos, asin, acos, tan, round } = Math;

/**
 * SOURCE: https://en.wikipedia.org/wiki/Sunrise_equation
 */

export const getSunriseAndSunset = (time: Timestamp, { lat, lon }: Loc): HalfDayArc => {
  const epochDayNumber = timeToEpochDayNumber(time);
  const meanSolarNoon = epochDayNumber - lon / PI2;
  const solarMeanAnomaly = (degToRad(357.5291) + 0.98560028 * meanSolarNoon) % PI2;
  const equationOfTheCenter =
    1.9148 * sin(solarMeanAnomaly) + 0.02 * sin(2 * solarMeanAnomaly) + 0.0003 * sin(3 * solarMeanAnomaly);
  const eclipticLongitude = (solarMeanAnomaly + equationOfTheCenter + PI + degToRad(102.984378)) % PI2;
  const solarTransit =
    JULIAN_DATE_OF_MILLENIUM +
    0.5 +
    meanSolarNoon +
    0.0053 * sin(solarMeanAnomaly) -
    0.0069 * sin(2 * eclipticLongitude);
  console.log(new Date(julianDateToTime(solarTransit)).toLocaleString());
  const declination = asin(sin(eclipticLongitude) * sin(degToRad(23.44)));
  const hourAngle = acos(-tan(lat) * tan(declination));
  const A = hourAngle / PI2;
  console.log(hourAngle);
  return {
    set: julianDateToTime(solarTransit - A),
    rise: julianDateToTime(solarTransit + A)
  };
};
