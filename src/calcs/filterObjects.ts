import { NgcObject, NgcInfo, NightInfo, Loc, Timestamp, Deg, Interval } from './types';
import { getHalfDayArcFactory } from './halfDaysArcs';
import { getLocation, degToRad, hmsToRad, dmsToRad } from './units';
import { toNoon, toMidnight } from './time';
import { getIntersection, isInInterval } from './interval';
import { getEqCoordsOnDate } from './corrections';
import { eqToAz } from './coords';
import { Filter } from '../types';

const getMax = (intersection: Interval, transit: Timestamp): Timestamp => {
  if (!intersection || !transit) return null;
  if (isInInterval(intersection, transit)) return transit;
  if (transit < intersection.start) return intersection.start;
  if (transit > intersection.end) return intersection.end;
  return null;
};

export default (
  ngcObjects: NgcObject[],
  { latitude, longitude, altitude, brightnessFilter, magnitude, surfaceBrightness, types: typeFilter }: Filter,
  night: Interval
): NgcInfo[] => {
  if (!night) return [];
  const location = getLocation(latitude, longitude);
  const refTime = night.start;
  const getHalfDayArc = getHalfDayArcFactory(refTime, location, degToRad(altitude));
  return (
    ngcObjects
      //.filter(({ ngc }) => ngc === 5055)
      .filter(object => {
        const types = object.type.split('+');
        return (
          (brightnessFilter === 'magnitude'
            ? Number.isFinite(object.magnitude) && object.magnitude < magnitude
            : Number.isFinite(object.surfaceBrightness) && object.surfaceBrightness < surfaceBrightness) &&
          types.some(t => typeFilter[t])
        );
      })
      .map(object => {
        const ra = hmsToRad(object.eqCoords.ra);
        const de = dmsToRad(object.eqCoords.de);
        const eqCoordsOnJ2000 = { ra, de };
        const eqCoordsOnDate = getEqCoordsOnDate(eqCoordsOnJ2000, refTime);
        const hda = getHalfDayArc(eqCoordsOnDate);
        //console.log(hda);
        const transit = Math.round((hda.start + hda.end) / 2);
        const intersection = getIntersection(hda, night);
        const max = getMax(intersection, transit);
        const { alt: altitudeAtMax } = eqToAz(max, location, eqCoordsOnDate);
        return { object, eqCoordsOnDate, intersection, transit, max, altitudeAtMax };
      })
      .filter(ngcInfo => ngcInfo.intersection)
  );
};
