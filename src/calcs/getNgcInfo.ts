import { NgcObject, NgcInfo, Loc, Interval, Timestamp, Deg } from './types';
import { getLocation, degToRad, hmsToRad, dmsToRad } from './units';
import getHalfDayArc from './getHalfDayArc';
import { getEqCoordsOnDate } from './corrections';
import { getIntersection, isInInterval } from './interval';
import { eqToAz } from './coords';
import getTransit from './getTransit';

const getMax = (intersection: Interval, transit: Timestamp): Timestamp => {
  if (!intersection || !transit) return null;
  if (isInInterval(intersection, transit)) return transit;
  if (transit < intersection.start) return intersection.start;
  if (transit > intersection.end) return intersection.end;
  return null;
};

export default (date: Timestamp, night: Interval, location: Loc, minAltitude: Deg) => (object: NgcObject): NgcInfo => {
  const ra = hmsToRad(object.eqCoords.ra);
  const de = dmsToRad(object.eqCoords.de);
  const eqCoordsOnJ2000 = { ra, de };
  const eqCoordsOnDate = getEqCoordsOnDate(eqCoordsOnJ2000, night.start);
  const hda = getHalfDayArc(night.start, location, degToRad(minAltitude), eqCoordsOnDate);
  const hda0 = getHalfDayArc(night.start, location, 0, eqCoordsOnDate);
  const transit = getTransit(eqCoordsOnDate, location, date);
  const { alt: altitudeAtTransit } = transit ? eqToAz(transit, location, eqCoordsOnDate) : { alt: null };
  const intersection = getIntersection(hda, night);
  const max = transit ? getMax(intersection, transit) : null;
  const sum = intersection ? intersection.end - intersection.start : 0;
  const { alt: altitudeAtMax } = max ? eqToAz(max, location, eqCoordsOnDate) : { alt: null };
  return { object, eqCoordsOnDate, intersection, transit, max, sum, altitudeAtMax, altitudeAtTransit, hda, hda0 };
};
