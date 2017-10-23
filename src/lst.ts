import moment = require('moment');

const GST_2017_10_23 = 31.600709; // Reference Greenwich Sidereal Time in degrees
const REFERENCE_TIME = '2017-10-23T00:00:00.000Z';
const SOLAR_TO_SIDEREAL_FACTOR = 1.002737909350795; // Factor to change sidereal days to solar days

const getElapsedDaysFromReference = (localTime: number): number =>
  moment(localTime).diff(moment(REFERENCE_TIME), 'days', true);

/**
 * Get Greenwich Local Sidereal Time in degrees
 */
const getGst = (elapsedDays: number): number => {
  const sum = GST_2017_10_23 + SOLAR_TO_SIDEREAL_FACTOR * elapsedDays * 360;
  return sum % 360;
};

export const getLst = (localTime: number, longitude: number): number => {
  const elapsedDays = getElapsedDaysFromReference(localTime);
  const gst = getGst(elapsedDays);
  return (gst + longitude) % 360;
};
