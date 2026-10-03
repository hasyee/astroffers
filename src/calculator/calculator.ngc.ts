import type { Interval, NgcInfo, NgcObject, ObjectFilter, Position, Radians, Timestamp } from './calculator.types';
import { degToRad } from './calculator.units';
import { toNextDay, toNoon } from './calculator.time';
import { getIntersection, isInInterval } from './calculator.interval';
import { eqToAz } from './calculator.coords';
import { timeToLst } from './calculator.lst';
import { getEqCoordsOnDate, getElapsedYearsSinceJ2000 } from './calculator.precession';
import { getHalfDayArc } from './calculator.halfDayArc';
import { getTransit } from './calculator.transit';

const MINUTE = 60 * 1000;

/** Values depending only on the date, the location and the night, shared by every object */
type Context = {
  night: Interval;
  location: Position;
  minAltitude: Radians;
  elapsedYears: number;
  /** Sidereal time at the noon of the date */
  t1: Radians;
  /** Sidereal time at the next noon */
  t2: Radians;
};

const getMax = (intersection: Interval, transit: Timestamp): Timestamp => {
  if (isInInterval(intersection, transit)) return transit;
  return transit < intersection.start ? intersection.start : intersection.end;
};

const getNgcInfo = (
  { night, location, minAltitude, elapsedYears, t1, t2 }: Context,
  object: NgcObject
): Omit<NgcInfo, 'intersection'> & { intersection: Interval | null } => {
  const eqCoordsOnDate = getEqCoordsOnDate({ ra: object.ra, de: object.de }, elapsedYears);
  const hda = getHalfDayArc(night.start, location, minAltitude, eqCoordsOnDate);
  const hda0 = getHalfDayArc(night.start, location, 0, eqCoordsOnDate);
  const transit = getTransit(eqCoordsOnDate, location, t1, t2);
  const altitudeAtTransit = transit ? eqToAz(transit, location, eqCoordsOnDate).alt : null;
  const intersection = getIntersection(hda, night);
  const max = intersection && transit ? getMax(intersection, transit) : null;
  const sum = intersection ? intersection.end - intersection.start : 0;
  const altitudeAtMax = max ? eqToAz(max, location, eqCoordsOnDate).alt : null;
  return { object, eqCoordsOnDate, intersection, transit, max, sum, altitudeAtMax, altitudeAtTransit, hda, hda0 };
};

const matchesBrightness = (object: NgcObject, filter: ObjectFilter) => {
  const value = object[filter.brightnessFilter];
  return value !== undefined && value < filter[filter.brightnessFilter];
};

const isVisible = (ngcInfo: ReturnType<typeof getNgcInfo>, observationTime: number): ngcInfo is NgcInfo =>
  !!ngcInfo.intersection && observationTime * MINUTE < ngcInfo.sum;

/** Objects of the catalog matching the filter, which are visible long enough during the night */
export const getObjects = (
  catalog: NgcObject[],
  date: Timestamp,
  location: Position,
  night: Interval | null,
  filter: ObjectFilter
): NgcInfo[] => {
  if (!night) return [];
  const context: Context = {
    night,
    location,
    minAltitude: degToRad(filter.altitude),
    elapsedYears: getElapsedYearsSinceJ2000(night.start),
    t1: timeToLst(toNoon(date), location.lon, false),
    t2: timeToLst(toNoon(toNextDay(date)), location.lon, false)
  };
  return catalog
    .filter(
      object =>
        matchesBrightness(object, filter) &&
        object.types.some(type => filter.types[type]) &&
        filter.constellations[object.constellation]
    )
    .map(object => getNgcInfo(context, object))
    .filter(ngcInfo => isVisible(ngcInfo, filter.observationTime));
};
