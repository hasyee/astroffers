const catalog = require('../data/ngc.json');
import { radToHms, radToDms, degToRad, dmsToRad, hmsToRad, hoursToRad } from './units';
import { eqToAz } from './coords';

console.log('%%%%%%%%%%%%%', radToHms(hoursToRad(2.83)));

const time = Date.parse('2017-10-30T00:00:00.000');
const location = { lat: degToRad(47), lon: degToRad(20) };

const andromeda = catalog.find(({ ngc }) => ngc === 224);
//const helix = catalog.find(({ ngc }) => ngc === 7293);

console.log(andromeda);
const { ra, de } = andromeda.eqCoords;

const azCoords = eqToAz(time, location, { ra: hmsToRad(ra), de: dmsToRad(de) });

//console.log('EQ:', radToHms(eq.ra), radToDms(eq.de));
console.log('AZ:', radToDms(azCoords.az), 'ALT:', radToDms(azCoords.alt));
//console.log(azCoords.az, degToDms(azCoords.alt));
