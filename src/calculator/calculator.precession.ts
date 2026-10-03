/**
 * SOURCE: http://www.cv.nrao.edu/~rfisher/Ephemerides/earth_rot.html
 */

import moment from 'moment';
import type { Eq, Timestamp } from './calculator.types';
import { hmsToRad, dmsToRad } from './calculator.units';

const { sin, cos, tan } = Math;

const MILLENIUM = moment('2000-01-01T00:00:00.000Z');

export const getElapsedYearsSinceJ2000 = (time: Timestamp) => moment(time).diff(MILLENIUM, 'years', true);

/** Corrects J2000 coordinates with the precession of the given number of years since J2000 */
export const getEqCoordsOnDate = ({ ra, de }: Eq, elapsedYears: number): Eq => {
  const deltaRa = (3.075 + 1.336 * sin(ra) * tan(de)) * elapsedYears;
  const deltaDe = 20.04 * cos(ra) * elapsedYears;
  return {
    ra: ra + hmsToRad({ sec: deltaRa }),
    de: de + dmsToRad({ arcSec: deltaDe })
  };
};
