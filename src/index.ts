const catalog = require('../data/ngc.json');
import { radToHms, radToDms, degToRad, hmsToRad, dmsToRad } from './units';
import { eqToAz } from './coords';

const time = Date.now();
const location = { lat: degToRad(47), lon: degToRad(20) };

const andromeda = catalog.find(({ ngc }) => ngc === 224);
const helix = catalog.find(({ ngc }) => ngc === 7293);

console.log(helix);
const { ra, de } = helix.eqCoords;

const azCoords = eqToAz(time, location, { ra: hmsToRad(ra), de: dmsToRad(de) });

//console.log('EQ:', radToHms(eq.ra), radToDms(eq.de));
console.log('AZ:', radToDms(azCoords.az), 'ALT:', radToDms(azCoords.alt));
//console.log(azCoords.az, degToDms(azCoords.alt));
