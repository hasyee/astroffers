const catalog = require('../data/ngc.json');
import { radToHms, radToDmsString, radToHmsString, degToRad, dmsToRad, hmsToRad, hoursToRad } from './units';
import { eqToAz } from './coords';

const time = '2017-10-31T15:00:00+01:00';
const lat = 47;
const lon = 20;
console.log('TIME:', time, 'LAT:', lat, 'LON:', lon);
const location = { lat: degToRad(lat), lon: degToRad(lon) };

//const andromeda = catalog.find(({ ngc }) => ngc === 224);
const helix = catalog.find(({ ngc }) => ngc === 7293);

//console.log(andromeda);
const ra = hmsToRad(helix.eqCoords.ra);
const de = dmsToRad(helix.eqCoords.de);
const { az, alt } = eqToAz(Date.parse(time), location, { ra, de });
console.log(alt)
console.log('RA:', radToHmsString(ra), 'DE:', radToDmsString(de));
console.log('AZ:', radToDmsString(az), 'ALT:', radToDmsString(alt));
//console.log(azCoords.az, degToDms(azCoords.alt));
