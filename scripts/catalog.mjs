/**
 * Builds the compact catalog used by the app from the original astroffers-core data.
 *
 * Usage: node scripts/catalog.mjs [path/to/astroffers-core/data]
 *
 * Output (src/catalog/):
 * - catalog.json: NGC objects and the Messier objects without an NGC number, with J2000 coordinates in radians,
 *   size in arc minutes and missing values omitted
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

/** NGC objects given the Messier number of an IC object by mistake: M24 is IC 4715, M25 is IC 4725 */
const IC_MESSIERS = new Set([4715, 4725]);

/** Surface brightness from the magnitude and the size (arc minutes), as in the source data */
const getSurfaceBrightness = (magnitude, [a, b]) =>
  Math.round((magnitude + 2.5 * Math.log10((Math.PI / 4) * a * b)) * 10) / 10;

const nonNgc = ({ size, magnitude, ...object }) => ({
  ...object,
  size: size && [{ arcMin: size[0] }, { arcMin: size[1] }],
  magnitude,
  surfaceBrightness: size ? getSurfaceBrightness(magnitude, size) : undefined
});

/** Messier objects without an NGC number, missing from the source data (positions and sizes of SEDS) */
const NON_NGC_MESSIERS = [
  {
    messier: 24,
    name: 'Sagittarius Star Cloud',
    eqCoords: { ra: { hour: 18, min: 16.9 }, de: { deg: -18, arcMin: -29 } },
    constellation: 'Sgr',
    size: [90, 90],
    magnitude: 4.6,
    types: ['MWSC']
  },
  {
    messier: 25,
    eqCoords: { ra: { hour: 18, min: 31.6 }, de: { deg: -19, arcMin: -15 } },
    constellation: 'Sgr',
    size: [32, 32],
    magnitude: 4.6,
    types: ['OC']
  },
  {
    messier: 40,
    name: 'Winnecke 4',
    eqCoords: { ra: { hour: 12, min: 22.4 }, de: { deg: 58, arcMin: 5 } },
    constellation: 'UMa',
    magnitude: 8.4,
    types: ['**']
  },
  {
    messier: 45,
    name: 'Pleiades',
    eqCoords: { ra: { hour: 3, min: 47 }, de: { deg: 24, arcMin: 7 } },
    constellation: 'Tau',
    size: [110, 110],
    magnitude: 1.6,
    types: ['OC']
  }
].map(nonNgc);

const withoutIcMessiers = object =>
  IC_MESSIERS.has(object.ngc) ? Object.fromEntries(Object.entries(object).filter(([key]) => key !== 'messier')) : object;

/**
 * Id of an object, also in the route of the app: `m<Messier number>` for a Messier object, else `ngc<NGC number>`.
 * A Messier number of more NGC objects (e.g. M76 of NGC 650 and 651) is the id of the first one only.
 */
const withIds = objects => {
  const messierIds = new Set();
  return objects.map(object => {
    const messierId = object.messier !== undefined && object.messier !== null ? `m${object.messier}` : null;
    const id = messierId && !messierIds.has(messierId) ? messierId : `ngc${object.ngc}`;
    if (messierId) messierIds.add(messierId);
    return { id, ...object };
  });
};

const toCompact = ({ id, ngc, messier, name, eqCoords, constellation, size, magnitude, surfaceBrightness, types }) =>
  Object.fromEntries(
    Object.entries({
      id,
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
// the Messier objects without an NGC number at the end, without `ngc`
write('catalog.json', withIds([...read('ngc.json').map(withoutIcMessiers), ...NON_NGC_MESSIERS]).map(toCompact));
// double stars can be filtered on too, e.g. M40
write('catalog.types.json', { ...read('types.json'), '**': 'Double Star' });
write('catalog.allTypes.json', read('all-types.json'));
write('catalog.constellations.json', read('constellations.json'));
