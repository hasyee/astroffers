import moment = require('moment');
import { Rad, Timestamp, Eq } from './types';
import { hmsToRad, dmsToRad } from './units';

const { sin, cos, tan } = Math;

const MILLENIUM = '2000-01-01T00:00:00.000Z';
const A = 3.075;
const B = 1.336;
const C = 20.04;

export const getEqCoordsOnDate = ({ ra, de }: Eq, time: Timestamp): Eq => {
  const elapsedYears = moment(time).diff(moment(MILLENIUM), 'years', true);
  const deltaRa = (A + B * sin(ra) * tan(de)) * elapsedYears;
  const deltaDe = C * cos(ra) * elapsedYears;
  return {
    ra: ra + hmsToRad({ sec: deltaRa }),
    de: de + dmsToRad({ arcSec: deltaDe })
  };
};
