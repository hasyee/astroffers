import { Timestamp, Day, Deg, Rad } from './types';
import { degToRad, radToDeg, PI2, hmsToRad } from './units';
import moment = require('moment');

const GST_REFERENCE = hmsToRad({ hour: 2, min: 37, sec: 57.4 });
const GST_REFERENCE_TIME = Date.parse('2017-10-31T00:00:00.000Z');
const EARTH_ANGLULAR_SPEED = 0.00007292115146706924; // radians per second

const getElapsedSeconds = (localTime: Timestamp): number => (localTime - GST_REFERENCE_TIME) / 1000;

/**
 * Get Greenwich Local Sidereal Time in degrees
 */
const timeToGst = (localTime: Timestamp): Rad => {
  const elapsedSeconds = getElapsedSeconds(localTime);
  return GST_REFERENCE + elapsedSeconds * EARTH_ANGLULAR_SPEED;
};

export const timeToLst = (localTime: Timestamp, longitude: Rad = 0, normalize = true): Rad => {
  const gst = timeToGst(localTime);
  const unnormalized = gst + longitude;
  return normalize ? unnormalized % PI2 : unnormalized;
};

/** 
 * These functions work properly if LST is not normalized
*/

const gstToTime = (gst: Rad): Timestamp => {
  const elapsedSeconds = (gst - GST_REFERENCE) / EARTH_ANGLULAR_SPEED;
  return Math.round((GST_REFERENCE_TIME + elapsedSeconds) * 1000);
};

export const lstToTime = (lst: Rad, longitude: Rad = 0): Timestamp => {
  const gst = lst - longitude;
  return gstToTime(gst);
};
