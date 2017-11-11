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
  const ngcNoon = toNoon(date);
  const getHalfDayArc = getHalfDayArcFactory(ngcNoon, location, degToRad(altitideLimit));
  return ngcObjects
    .filter(object => Number.isFinite(object.magnitude) && object.magnitude < magnitudeLimit)
    .map(object => {
      const ra = hmsToRad(object.eqCoords.ra);
      const de = dmsToRad(object.eqCoords.de);
      const eqCoordsOnJ2000 = { ra, de };
      const eqCoordsOnDate = getEqCoordsOnDate(eqCoordsOnJ2000, ngcNoon);
      const hda = getHalfDayArc(eqCoordsOnDate);
      const transit = Math.round((hda.start + hda.end) / 2);
      const intersection = getIntersection(hda, astroNight);
      return { object, eqCoordsOnDate, intersection, transit };
    })
    .filter(ngcInfo => ngcInfo.intersection);
};
