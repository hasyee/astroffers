import { NgcObject, NgcInfo, NightInfo, Loc, Timestamp, Deg } from './types';
import { getHalfDayArcFactory } from './halfDaysArcs';
import { getLocation, degToRad, hmsToRad, dmsToRad } from './units';
import { toMidnight } from './time';
import { getIntersection } from './interval';
import { getEqCoordsOnDate } from './corrections';

export default (
  ngcObjects: NgcObject[],
  date: Timestamp,
  latitude: Deg,
  longitude: Deg,
  { moonlessNight }: NightInfo,
  altitideLimit: Deg,
  magnitudeLimit: number
): NgcInfo[] => {
  const location = getLocation(latitude, longitude);
  const midnight = toMidnight(date);
  const getHalfDayArc = getHalfDayArcFactory(midnight, location, degToRad(altitideLimit));
  return ngcObjects
    .map(object => {
      const ra = hmsToRad(object.eqCoords.ra);
      const de = dmsToRad(object.eqCoords.de);
      const eqCoordsOnJ2000 = { ra, de };
      const eqCoordsOnDate = getEqCoordsOnDate(eqCoordsOnJ2000, midnight);
      const ngcHda = getHalfDayArcFactory(midnight, location, altitideLimit)(eqCoordsOnJ2000);
      const intersection = getIntersection(ngcHda, moonlessNight);
      return { object, eqCoordsOnDate, intersection };
    })
    .filter(ngcInfo => ngcInfo.object.magnitude < magnitudeLimit);
};
