const catalog = require('../data/SAC Deep Sky Database 8.1.json');
import { getLst } from './lst';
import { degToHms } from './units';

const location = { lat: 47.4549775, lon: 19.0392238 };
const lst = getLst(Date.now(), location.lon);

console.log(degToHms(lst));
