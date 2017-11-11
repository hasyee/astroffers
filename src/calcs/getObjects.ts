import { NgcObject, NgcInfo, NightInfo, Loc, Timestamp, Deg } from './types';
import { getHalfDayArcFactory } from './halfDaysArcs';
import { getLocation, degToRad, hmsToRad, dmsToRad } from './units';
import { toNoon } from './time';
import { getIntersection } from './interval';
import { getEqCoordsOnDate } from './corrections';

export default (
  ngcObjects: NgcObject[],
  date: Timestamp,
  latitude: Deg,
  longitude: Deg,
  { astroNight }: NightInfo,
  altitideLimit: Deg,
  magnitudeLimit: number
): NgcInfo[] => {
  const location = getLocation(latitude, longitude);
  const noon = toNoon(date);
  const getHalfDayArc = getHalfDayArcFactory(noon, location, degToRad(altitideLimit));
  return ngcObjects
    .filter(object => Number.isFinite(object.magnitude) && object.magnitude < magnitudeLimit)
    .map(object => {
      const ra = hmsToRad(object.eqCoords.ra);
      const de = dmsToRad(object.eqCoords.de);
      const eqCoordsOnJ2000 = { ra, de };
      const eqCoordsOnDate = getEqCoordsOnDate(eqCoordsOnJ2000, noon);
      const ngcHda = getHalfDayArc(eqCoordsOnJ2000);
      const intersection = getIntersection(ngcHda, astroNight);
      return { object, eqCoordsOnDate, intersection };
    })
    .filter(ngcInfo => ngcInfo.intersection);
};
