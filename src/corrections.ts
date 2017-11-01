/**
 * SOURCE: http://www.cv.nrao.edu/~rfisher/Ephemerides/earth_rot.html
 */

import moment = require('moment');
import { Rad, Timestamp, Eq } from './types';
import { hmsToRad, dmsToRad, timeToEpochDayNumber } from './units';

const { sin, cos, tan } = Math;

const MILLENIUM = '2000-01-01T00:00:00.000Z';

export const getEqCoordsOnDate = ({ ra, de }: Eq, time: Timestamp): Eq => {
  const { ra: deltaRa, de: deltaDe } = getCorrectionOfPrecession({ ra, de }, time);
  return {
    ra: ra + deltaRa,
    de: de + deltaDe
  };
};

export const getCorrectionOfPrecession = ({ ra, de }: Eq, time: Timestamp): Eq => {
  const elapsedYears = moment(time).diff(moment(MILLENIUM), 'years', true);
  const deltaRaInPrecession = (3.075 + 1.336 * sin(ra) * tan(de)) * elapsedYears;
  const deltaDeInPrecession = 20.04 * cos(ra) * elapsedYears;
  return {
    ra: hmsToRad({ sec: deltaRaInPrecession }),
    de: dmsToRad({ arcSec: deltaDeInPrecession })
  };
};

/**
 * dL: nutation in longitude
 * dE: nutation in obliquity of the ecliptic
 */
export const getNutation = (time: Timestamp): { dL: Rad; dE: Rad } => {
  const d = timeToEpochDayNumber(time);
  const dL = -17.3 * sin(125.0 - 0.05295 * d) - 1.4 * sin(200.0 + 1.97129 * d);
  const dE = 9.4 * cos(125.0 - 0.05295 * d) + 0.7 * cos(200.0 + 1.97129 * d);
  return {
    dL: dmsToRad({ arcSec: dL }),
    dE: dmsToRad({ arcSec: dE })
  };
};

export const getCorrectionOfNutation = ({ ra, de }: Eq, time: Timestamp): Eq => {
  const { dL, dE } = getNutation(time);
  const deltaRaInNutation = (0.9175 + 0.3978 * sin(ra) * tan(de)) * dL - cos(ra) * tan(de) * dE;
  const deltaDeInNutation = 0.3978 * cos(ra) * dL + sin(ra) * dE;
  return {
    ra: hmsToRad({ sec: deltaRaInNutation }),
    de: dmsToRad({ arcSec: deltaDeInNutation })
  };
};
