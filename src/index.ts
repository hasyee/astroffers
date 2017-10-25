const catalog = require('../data/SAC Deep Sky Database 8.1.json');
import { radToHms, radToDms, degToRad } from './units';
import { getEqCoordsOfObject, eqToAz } from './coords';

const time = Date.now();
const location = { lat: degToRad(47), lon: degToRad(20) };

const andromeda = catalog.find(({ object }) => object === 'NGC224');

//console.log(andromeda);

const eq = getEqCoordsOfObject(andromeda);
const azCoords = eqToAz(time, location, eq);

//console.log('EQ:', radToHms(eq.ra), radToDms(eq.de));
console.log('AZ:', radToDms(azCoords.az), 'ALT:', radToDms(azCoords.alt));
//console.log(azCoords.az, degToDms(azCoords.alt));
