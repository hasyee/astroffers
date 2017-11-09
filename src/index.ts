import { NGCObject } from './types';
import { radToHms, radToDmsString, radToHmsString, degToRad, dmsToRad, hmsToRad, hoursToRad } from './units';
import { eqToAz } from './coords';
import { getEqCoordsOnDate } from './corrections';
import { getHalfDayArcFactory } from './halfDaysArcs';
import { getSunriseAndSunset } from './sun';
const catalog: NGCObject[] = require('../data/ngc.json');

/**
 * PHOTOS:
 * http://www.ngcicproject.org/dss/n/7/n7662.jpg
 * http://stdatu.stsci.edu/cgi-bin/dss_form?target=ngc1976&resolver=SIMBAD
 */

const time = '2017-11-09T12:00:00+01:00';
const lat = 47;
const lon = 20;
console.log('TIME:', time, 'LAT:', lat, 'LON:', lon);
const location = { lat: degToRad(lat), lon: degToRad(lon) };
const timestamp = Date.parse(time);

const HELIX = 7293;
const ANDROMEDA = 224;
const ORION = 1976;
const M51 = 5194;
const NGC = ORION;
const object = catalog.find(({ ngc }) => ngc === NGC);
const ra = hmsToRad(object.eqCoords.ra);
const de = dmsToRad(object.eqCoords.de);
const eqCoordsOnJ2000 = { ra, de };
const eqCoordsOnDate = getEqCoordsOnDate(eqCoordsOnJ2000, timestamp);
const { rise: ngcRise, set: ngcSet } = getHalfDayArcFactory(timestamp, location)(eqCoordsOnJ2000);
console.log('RISING:', new Date(ngcRise).toLocaleString());
console.log('SETTING:', new Date(ngcSet).toLocaleString());

const { rise: sunRise, set: sunSet } = getSunriseAndSunset(timestamp, location);
console.log('SUN RISE:', new Date(sunRise).toLocaleString());
console.log('SUN SET:', new Date(sunSet).toLocaleString());
