import { Timestamp, Day, Deg, Rad } from './types';
import { degToRad, radToDeg, PI2 } from './units';
import moment = require('moment');

const GST_2017_10_23 = degToRad(31.600709); // Reference Greenwich Sidereal Time in degrees
const REFERENCE_TIME = '2017-10-23T00:00:00.000Z';
const SOLAR_TO_SIDEREAL_FACTOR = 1.002737909350795; // Factor to change sidereal days to solar days

const getElapsedDaysFromReference = (localTime: Timestamp): Day =>
  moment(localTime).diff(moment(REFERENCE_TIME), 'days', true);

/**
 * Get Greenwich Local Sidereal Time in degrees
 */
const getGst = (elapsedDays: Day): Rad => {
  const sum = GST_2017_10_23 + SOLAR_TO_SIDEREAL_FACTOR * elapsedDays * PI2;
  return sum % PI2;
};

export const getLst = (localTime: Timestamp, longitude: Rad): Rad => {
  const elapsedDays = getElapsedDaysFromReference(localTime);
  const gst = getGst(elapsedDays);
  return (gst + longitude) % PI2;
};
