const catalog = require('../data/ngc.json');
import { radToHms, radToDmsString, radToHmsString, degToRad, dmsToRad, hmsToRad, hoursToRad } from './units';
import { eqToAz } from './coords';
import { getEqCoordsOnDate } from './corrections';

const time = '2017-10-31T15:00:00+01:00';
const lat = 47;
const lon = 20;
console.log('TIME:', time, 'LAT:', lat, 'LON:', lon);
const location = { lat: degToRad(lat), lon: degToRad(lon) };
const timestamp = Date.parse(time);

//const andromeda = catalog.find(({ ngc }) => ngc === 224);
const helix = catalog.find(({ ngc }) => ngc === 7293);

//console.log(andromeda);
const ra = hmsToRad(helix.eqCoords.ra);
const de = dmsToRad(helix.eqCoords.de);
const eqCoordsOnJ2000 = { ra, de };
const eqCoordsOnDate = getEqCoordsOnDate(eqCoordsOnJ2000, timestamp);
const { az, alt } = eqToAz(timestamp, location, eqCoordsOnJ2000);
console.log('J2000 -', 'RA:', radToHmsString(ra), 'DE:', radToDmsString(de));
console.log('ON DATE -', 'RA:', radToHmsString(eqCoordsOnDate.ra), 'DE:', radToDmsString(eqCoordsOnDate.de));
console.log('AZ:', radToDmsString(az), 'ALT:', radToDmsString(alt));
//console.log(azCoords.az, degToDms(azCoords.alt));
