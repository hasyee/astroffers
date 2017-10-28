const catalog = require('../data/ngc.json');
import { radToHms, radToDms, degToRad, hmsToRad, dmsToRad } from './units';
import { eqToAz } from './coords';

const time = Date.parse("2017-10-29T00:00:00.000");
const location = { lat: degToRad(47.4925), lon: degToRad(19.0514) };

const andromeda = catalog.find(({ ngc }) => ngc === 224);
const helix = catalog.find(({ ngc }) => ngc === 7293);

console.log(helix);
const { ra, de } = helix.eqCoords;

const azCoords = eqToAz(time, location, { ra: hmsToRad(ra), de: dmsToRad(de) });

//console.log('EQ:', radToHms(eq.ra), radToDms(eq.de));
console.log('AZ:', radToDms(azCoords.az), 'ALT:', radToDms(azCoords.alt));
//console.log(azCoords.az, degToDms(azCoords.alt));
