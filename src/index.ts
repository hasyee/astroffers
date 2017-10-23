const catalog = require('../data/SAC Deep Sky Database 8.1.json');
import { getLst } from './lst';
import { degToHms, degToDms } from './units';
import { getEqCoordsOfObject, eqToAz } from './coords';

const location = { lat: 47, lon: 20 };
const lst = getLst(Date.now(), location.lon);

const andromeda = catalog.find(({ object }) => object === 'NGC224');

console.log(andromeda);

const eqCoords = getEqCoordsOfObject(andromeda);
const azCoords = eqToAz(lst, location.lat, eqCoords);

console.log('LST:', degToHms(lst), lst);
console.log(azCoords.az, degToDms(azCoords.alt));
