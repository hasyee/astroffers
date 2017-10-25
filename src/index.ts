const catalog = require('../data/SAC Deep Sky Database 8.1.json');
import { getLst } from './lst';
import { radToHms, radToDms, degToRad } from './units';
import { getEqCoordsOfObject, eqToAz } from './coords';

const location = { lat: degToRad(47), lon: degToRad(20) };
const lst = getLst(Date.now(), location.lon);

const andromeda = catalog.find(({ object }) => object === 'NGC224');

//console.log(andromeda);

const eq = getEqCoordsOfObject(andromeda);
const azCoords = eqToAz(lst, location, eq);

//console.log('EQ:', radToHms(eq.ra), radToDms(eq.de));
console.log('LST:', radToHms(lst));
console.log('AZ:', radToDms(azCoords.az), 'ALT:', radToDms(azCoords.alt));
//console.log(azCoords.az, degToDms(azCoords.alt));
