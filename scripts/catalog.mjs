/**
 * Builds the compact catalog used by the app from the original astroffers-core data.
 *
 * Usage: node scripts/catalog.mjs [path/to/astroffers-core/data]
 *
 * Output (src/catalog/):
 * - catalog.json: NGC objects, with J2000 coordinates in radians, size in arc minutes and missing values omitted
 * - catalog.types.json: object types that can be filtered on
 * - catalog.allTypes.json: display names of every object type
 * - catalog.constellations.json: display names of the constellations
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const source = process.argv[2] ?? join(root, '../astroffers-core/data');
const target = join(root, 'src/catalog');

const read = name => JSON.parse(readFileSync(join(source, name), 'utf8'));
const write = (name, data) => writeFileSync(join(target, name), JSON.stringify(data) + '\n');

const PI2 = 2 * Math.PI;
const round = decimals => value => Math.round(value * 10 ** decimals) / 10 ** decimals;
const round7 = round(7);
const round4 = round(4);

const hmsToRad = ({ hour = 0, min = 0, sec = 0 }) => ((hour + min / 60 + sec / 3600) / 24) * PI2;
const dmsToRad = ({ deg = 0, arcMin = 0, arcSec = 0 }) => ((deg + arcMin / 60 + arcSec / 3600) / 360) * PI2;
const dmsToArcMin = ({ deg = 0, arcMin = 0, arcSec = 0 }) => deg * 60 + arcMin + arcSec / 60;

const isNumber = value => typeof value === 'number' && Number.isFinite(value);

const toCompact = ({ ngc, messier, name, eqCoords, constellation, size, magnitude, surfaceBrightness, types }) =>
  Object.fromEntries(
    Object.entries({
      ngc,
      messier,
      name,
      ra: round7(hmsToRad(eqCoords.ra)),
      de: round7(dmsToRad(eqCoords.de)),
      constellation,
      size: size ? size.map(dms => round4(dmsToArcMin(dms))) : undefined,
      magnitude: isNumber(magnitude) ? magnitude : undefined,
      surfaceBrightness: isNumber(surfaceBrightness) ? surfaceBrightness : undefined,
      types
    }).filter(([, value]) => value !== undefined && value !== null)
  );

mkdirSync(target, { recursive: true });
write('catalog.json', read('ngc.json').map(toCompact));
write('catalog.types.json', read('types.json'));
write('catalog.allTypes.json', read('all-types.json'));
write('catalog.constellations.json', read('constellations.json'));
