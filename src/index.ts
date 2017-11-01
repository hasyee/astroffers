import { NGCObject } from './types';
import { radToHms, radToDmsString, radToHmsString, degToRad, dmsToRad, hmsToRad, hoursToRad } from './units';
import { eqToAz } from './coords';
import { getEqCoordsOnDate } from './corrections';
import { getHalfDayArcFactory } from './halfDaysArcs';
const catalog: NGCObject[] = require('../data/ngc.json');

const time = '2017-10-31T15:00:00+01:00';
const lat = 47;
const lon = 20;
console.log('TIME:', time, 'LAT:', lat, 'LON:', lon);
const location = { lat: degToRad(lat), lon: degToRad(lon) };
const timestamp = Date.parse(time);

const HELIX = 7293;
const ANDROMEDA = 224;
const ORION = 1976;
const NGC = ORION;

const object = catalog.find(({ ngc }) => ngc === NGC);

//console.log(andromeda);
const ra = hmsToRad(object.eqCoords.ra);
const de = dmsToRad(object.eqCoords.de);
const eqCoordsOnJ2000 = { ra, de };
const eqCoordsOnDate = getEqCoordsOnDate(eqCoordsOnJ2000, timestamp);
const { az, alt } = eqToAz(timestamp, location, eqCoordsOnDate);
console.log('J2000 -', 'RA:', radToHmsString(ra), 'DE:', radToDmsString(de));
console.log('ON DATE -', 'RA:', radToHmsString(eqCoordsOnDate.ra), 'DE:', radToDmsString(eqCoordsOnDate.de));
console.log('AZ:', radToDmsString(az), 'ALT:', radToDmsString(alt));

getHalfDayArcFactory(Date.parse('2017-11-01 12:00:00'), location)(eqCoordsOnJ2000);
//console.log(azCoords.az, degToDms(azCoords.alt));
