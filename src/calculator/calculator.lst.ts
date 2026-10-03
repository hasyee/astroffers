import type { Radians, Timestamp } from './calculator.types';
import { PI2, hmsToRad } from './calculator.units';

const GST_REFERENCE = hmsToRad({ hour: 2, min: 37, sec: 57.4 });
const GST_REFERENCE_TIME = Date.parse('2017-10-31T00:00:00.000Z');
const EARTH_ANGLULAR_SPEED = 0.00007292115146706924; // radians per second

const getElapsedSeconds = (time: Timestamp) => (time - GST_REFERENCE_TIME) / 1000;

/** Greenwich sidereal time */
const timeToGst = (time: Timestamp): Radians => GST_REFERENCE + getElapsedSeconds(time) * EARTH_ANGLULAR_SPEED;

/** Local sidereal time */
export const timeToLst = (time: Timestamp, longitude: Radians = 0, normalize = true): Radians => {
  const lst = timeToGst(time) + longitude;
  return normalize ? lst % PI2 : lst;
};

/** The inverse functions below work properly only with a non-normalized sidereal time. */

const gstToTime = (gst: Radians): Timestamp => {
  const elapsedSeconds = (gst - GST_REFERENCE) / EARTH_ANGLULAR_SPEED;
  return Math.round(GST_REFERENCE_TIME + elapsedSeconds * 1000);
};

export const lstToTime = (lst: Radians, longitude: Radians = 0): Timestamp => gstToTime(lst - longitude);
