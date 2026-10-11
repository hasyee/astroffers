import type { Radians, Timestamp } from './calculator.types';
import { PI2, hmsToRad } from './calculator.units';

const GST_REFERENCE = hmsToRad({ hour: 2, min: 37, sec: 57.4 });
const GST_REFERENCE_TIME = Date.parse('2017-10-31T00:00:00.000Z');
/**
 * Radians per second of the sidereal time: 1.00273790935 turns a day, faster than the rotation of the Earth relative to
 * the stars (7.2921151e-5) by the precession of the equinox, which it is measured from — that rate fell behind by ~28 s
 * (0.117°) in 2026, 9 years after the reference; within 1 s now from 2000 to 2050 (checked against astronomy-engine)
 */
const SIDEREAL_ANGULAR_SPEED = (PI2 * 1.00273790935) / 86400;

const getElapsedSeconds = (time: Timestamp) => (time - GST_REFERENCE_TIME) / 1000;

/** Greenwich sidereal time */
const timeToGst = (time: Timestamp): Radians => GST_REFERENCE + getElapsedSeconds(time) * SIDEREAL_ANGULAR_SPEED;

/** Local sidereal time */
export const timeToLst = (time: Timestamp, longitude: Radians = 0, normalize = true): Radians => {
  const lst = timeToGst(time) + longitude;
  return normalize ? lst % PI2 : lst;
};

/** The inverse functions below work properly only with a non-normalized sidereal time. */

const gstToTime = (gst: Radians): Timestamp => {
  const elapsedSeconds = (gst - GST_REFERENCE) / SIDEREAL_ANGULAR_SPEED;
  return Math.round(GST_REFERENCE_TIME + elapsedSeconds * 1000);
};

export const lstToTime = (lst: Radians, longitude: Radians = 0): Timestamp => gstToTime(lst - longitude);
