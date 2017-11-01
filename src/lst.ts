import { Timestamp, Day, Deg, Rad } from './types';
import { degToRad, radToDeg, PI2, hmsToRad } from './units';
import moment = require('moment');

//const GST_REFERENCE = hmsToRad({ hour: 6, min: 43, sec: 21.2 });
const GST_REFERENCE = hmsToRad({ hour: 2, min: 37, sec: 57.4 });
//const GST_REFERENCE_TIME = Date.parse('2017-01-01T00:00:00.000Z');
const GST_REFERENCE_TIME = Date.parse('2017-10-31T00:00:00.000Z');
const EARTH_ANGLULAR_SPEED = 0.00007292115146706924; // radians per second

const getElapsedSeconds = (localTime: Timestamp): number => (localTime - GST_REFERENCE_TIME) / 1000;

/**
 * Get Greenwich Local Sidereal Time in degrees
 */
const getGst = (localTime: Timestamp): Rad => {
  const elapsedSeconds = getElapsedSeconds(localTime);
  const sum = GST_REFERENCE + elapsedSeconds * EARTH_ANGLULAR_SPEED;
  return sum % PI2;
};

export const getLst = (localTime: Timestamp, longitude: Rad): Rad => {
  const gst = getGst(localTime);
  return (gst + longitude) % PI2;
};
