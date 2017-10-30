import { Timestamp, Day, Deg, Rad } from './types';
import { degToRad, radToDeg, PI2, hmsToRad } from './units';
import moment = require('moment');

//const GST_2017_10_23 = degToRad(31.600709); // Reference Greenwich Sidereal Time in degrees
//const REFERENCE_TIME = '2017-10-23T00:00:00.000Z';
const GST_2017_10_30 = hmsToRad({ hour: 2, min: 33, sec: 50.7 });
const REFERENCE_TIME = '2017-10-30T00:00:00.000Z';
//const SOLAR_TO_SIDEREAL_FACTOR = 1.002737909350795; // Factor to change solar days to sidereal days

const EARTH_ANGLULAR_SPEED = 0.00007292115146706924; // radians per second

const getElapsedDaysFromReference = (localTime: Timestamp): Day =>
  moment(localTime).diff(moment(REFERENCE_TIME), 'days', true);

const getElapsedSeconds = (localTime: Timestamp): number => (localTime - Date.parse(REFERENCE_TIME)) / 1000;

/**
 * Get Greenwich Local Sidereal Time in degrees
 */
const getGst = (elapsedSeconds: number): Rad => {
  /* const sum = GST_2017_10_23 + SOLAR_TO_SIDEREAL_FACTOR * elapsedDays * PI2;
  return sum % PI2; */
  const sum = GST_2017_10_30 + elapsedSeconds * EARTH_ANGLULAR_SPEED;
  return sum % PI2;
};

export const getLst = (localTime: Timestamp, longitude: Rad): Rad => {
  const elapsedSeconds = getElapsedSeconds(localTime);
  const gst = getGst(elapsedSeconds);
  return (gst + longitude) % PI2;
};
