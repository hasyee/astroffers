/**
 * Builds the data of the star map: the star layers from the Tycho-2 catalogue (Høg et al. 2000, CDS I/259,
 * CC BY-NC 3.0 IGO), and the lines and the boundaries of the constellations from the modern sky culture of
 * Stellarium (CC BY-SA 4.0; its boundaries are the IAU ones of Delporte, 1930, as edges by Patrick Barbier).
 *
 * Usage: node scripts/starmap.mjs
 *
 * The positions are J2000 (ICRS, at the epoch J2000).
 *
 * Output (src/stars/): a binary file of each star layer, from the main catalogue of Tycho-2 and its supplement 1 (the
 * brightest stars, missing from the main one), downloaded from CDS (~165 MB, unzipped on the fly, nothing is kept),
 * by the V magnitude rounded to 0.1 (V = VT - 0.09 (BT - VT), the VT or the BT alone when the other is missing, the
 * Hipparcos Hp of the supplement's brightest stars):
 * - stars.1.bin: to 6.5, the whole sky in one tile
 * - stars.2.bin: from 6.6 to 10, in tiles of about 10° × 10°
 * The supplement's positions are moved from the epoch J1991.25 by their proper motions, if any; the main catalogue's
 * stars without a mean position keep their observed ones (~1991).
 *
 * Format, little-endian, each array aligned to its element size:
 * - Uint32 bandCount: the sky is cut into bands of equal declination from -90° to 90°
 * - Uint32 cellCounts[bandCount]: each band into cells (the tiles) of equal right ascension from 0° to 360°
 * - Uint32 tileStarts[tileCount + 1]: the index of the first star of each tile, band by band, from 0° in each band;
 *   the last one is the number of the stars
 * - Uint16 ra[starCount], Uint16 dec[starCount]: the position within the star's tile, 0 at its lower edge and 65535
 *   at its upper one
 * - Uint8 magnitude[starCount]: (V + 2) × 10
 * The stars of a tile are sorted by their declination.
 *
 * Output (src/constellation/), in radians, flat lists of the coordinates of their points (ra, de, ra, de, ...):
 * - constellation.lines.json: the polylines of each constellation by its abbreviation, between the positions of
 *   their stars in the star layers (by their Hipparcos numbers)
 * - constellation.boundaries.json: the edges of the boundaries, each once, with the two constellations they
 *   separate: precessed from B1875, where they run along the meridians and the parallels, by points at most 1° apart
 *   (a parallel of B1875 is a curve in J2000)
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { createInterface } from 'node:readline';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';
import { createGunzip } from 'node:zlib';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const starsTarget = join(root, 'src/stars');
const constellationTarget = join(root, 'src/constellation');

const TYCHO_SOURCE = 'https://cdsarc.cds.unistra.fr/ftp/I/259';
const MAIN_FILES = Array.from({ length: 20 }, (_, index) => `tyc2.dat.${String(index).padStart(2, '0')}.gz`);
const SUPPLEMENT_FILE = 'suppl_1.dat.gz';
const SUPPLEMENT_EPOCH = 1991.25;
const SKY_CULTURE_SOURCE =
  'https://raw.githubusercontent.com/Stellarium/stellarium/master/skycultures/modern/index.json';

/** Degrees per cell at the equator: the cells of a band get narrower in right ascension towards the poles */
const LAYERS = [
  { file: 'stars.1.bin', maxMagnitude: 6.5, bandCount: 1, cellWidth: 360 },
  { file: 'stars.2.bin', maxMagnitude: 10, bandCount: 18, cellWidth: 10 }
];

const MAX_POSITION = 65535;
const MAGNITUDE_OFFSET = 2;
const MAGNITUDE_SCALE = 10;

/** Degrees between the points of a boundary's edge */
const MAX_EDGE_STEP = 1;
/** Julian dates of the equinoxes */
const B1875 = 2405889.258550475;
const J2000 = 2451545;

const DEG = Math.PI / 180;
const ARC_SEC = DEG / 3600;
const MAS_TO_DEG = 1 / 3_600_000;

/** Radians to 5 decimals, ~2 arc seconds */
const round = radians => Math.round(radians * 1e5) / 1e5;

const toMagnitudeCode = magnitude => Math.round((magnitude + MAGNITUDE_OFFSET) * MAGNITUDE_SCALE);
const MAX_MAGNITUDE_CODE = Math.max(...LAYERS.map(({ maxMagnitude }) => toMagnitudeCode(maxMagnitude)));

const fetchOk = async url => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: ${response.status}`);
  return response;
};

const readLines = async function* (file) {
  const response = await fetchOk(`${TYCHO_SOURCE}/${file}`);
  yield* createInterface({ input: Readable.fromWeb(response.body).pipe(createGunzip()), crlfDelay: Infinity });
};

/** A number of a fixed-width record by its bytes in the ReadMe (1-based, inclusive), undefined when blank */
const readNumber = (line, from, to) => {
  const value = line.slice(from - 1, to).trim();
  return value === '' ? undefined : Number(value);
};

/** Approximate Johnson V of the Tycho magnitudes (Note 7 of the ReadMe) */
const getMagnitude = (bt, vt) => (bt !== undefined && vt !== undefined ? vt - 0.09 * (bt - vt) : (vt ?? bt));

const normalizeRa = ra => ((ra % 360) + 360) % 360;

const toStar = (ra, dec, magnitude, hip) => ({
  ra: normalizeRa(ra),
  dec: Math.min(90, Math.max(-90, dec)),
  magnitude: toMagnitudeCode(magnitude),
  hip
});

const readMainStar = line => {
  // 'X': no mean position, nor proper motion
  const hasMeanPosition = line[13] !== 'X';
  return toStar(
    hasMeanPosition ? readNumber(line, 16, 27) : readNumber(line, 153, 164),
    hasMeanPosition ? readNumber(line, 29, 40) : readNumber(line, 166, 177),
    getMagnitude(readNumber(line, 111, 116), readNumber(line, 124, 129)),
    readNumber(line, 143, 148)
  );
};

const readSupplementStar = line => {
  const ra = readNumber(line, 16, 27);
  const dec = readNumber(line, 29, 40);
  const pmRa = readNumber(line, 42, 48) ?? 0;
  const pmDec = readNumber(line, 50, 56) ?? 0;
  const years = 2000 - SUPPLEMENT_EPOCH;
  // the VT is the Hp when the BT is missing
  return toStar(
    ra + (pmRa * MAS_TO_DEG * years) / Math.cos(dec * DEG),
    dec + pmDec * MAS_TO_DEG * years,
    getMagnitude(readNumber(line, 84, 89), readNumber(line, 97, 102)),
    readNumber(line, 116, 121)
  );
};

const readStars = async (file, readStar) => {
  const stars = [];
  for await (const line of readLines(file)) {
    const star = readStar(line);
    if (star.magnitude <= MAX_MAGNITUDE_CODE) stars.push(star);
  }
  console.log(`${file}: ${stars.length} stars`);
  return stars;
};

const getCellCounts = (bandCount, cellWidth) =>
  Array.from({ length: bandCount }, (_, band) =>
    Math.max(1, Math.round((360 / cellWidth) * Math.cos((-90 + ((band + 0.5) * 180) / bandCount) * DEG)))
  );

const toPosition = (value, from, size) => Math.min(MAX_POSITION, Math.round(((value - from) / size) * MAX_POSITION));

const encodeLayer = (stars, cellCounts) => {
  const bandHeight = 180 / cellCounts.length;
  const bandFirstTiles = cellCounts.reduce((firsts, count) => [...firsts, firsts.at(-1) + count], [0]);
  const tileCount = bandFirstTiles.at(-1);
  const encoded = stars
    .map(({ ra, dec, magnitude }) => {
      const band = Math.min(cellCounts.length - 1, Math.floor((dec + 90) / bandHeight));
      const cellWidth = 360 / cellCounts[band];
      const cell = Math.min(cellCounts[band] - 1, Math.floor(ra / cellWidth));
      return {
        tile: bandFirstTiles[band] + cell,
        ra: toPosition(ra, cell * cellWidth, cellWidth),
        dec: toPosition(dec, -90 + band * bandHeight, bandHeight),
        magnitude
      };
    })
    .sort((a, b) => a.tile - b.tile || a.dec - b.dec || a.ra - b.ra || a.magnitude - b.magnitude);
  const tileCounts = encoded.reduce((counts, { tile }) => ((counts[tile] += 1), counts), new Uint32Array(tileCount));
  const tileStarts = tileCounts.reduce((starts, count) => [...starts, starts.at(-1) + count], [0]);
  const header = Uint32Array.from([cellCounts.length, ...cellCounts, ...tileStarts]);
  return {
    data: Buffer.concat([
      Buffer.from(header.buffer),
      Buffer.from(Uint16Array.from(encoded, ({ ra }) => ra).buffer),
      Buffer.from(Uint16Array.from(encoded, ({ dec }) => dec).buffer),
      Buffer.from(Uint8Array.from(encoded, ({ magnitude }) => magnitude).buffer)
    ]),
    tileCount,
    maxTileStars: Math.max(...tileCounts)
  };
};

/** Our abbreviations by the upper-cased ones of Stellarium, whose Serpens is in two parts (SER1, SER2) */
const constellations = new Map(
  Object.keys(JSON.parse(readFileSync(join(root, 'src/catalog/catalog.constellations.json'), 'utf8'))).map(
    abbreviation => [abbreviation.toUpperCase(), abbreviation]
  )
);
const toConstellation = abbreviation => {
  const constellation = constellations.get(abbreviation.toUpperCase().replace(/\d$/, ''));
  if (!constellation) throw new Error(`Unknown constellation: ${abbreviation}`);
  return constellation;
};

/** Rigorous precession of the equator and the equinox (IAU 1976, Meeus 21.2-21.4), degrees */
const precess = (from, to) => {
  const T = (from - J2000) / 36525;
  const t = (to - from) / 36525;
  const zeta =
    ((2306.2181 + 1.39656 * T - 0.000139 * T ** 2) * t + (0.30188 - 0.000344 * T) * t ** 2 + 0.017998 * t ** 3) *
    ARC_SEC;
  const z =
    ((2306.2181 + 1.39656 * T - 0.000139 * T ** 2) * t + (1.09468 + 0.000066 * T) * t ** 2 + 0.018203 * t ** 3) *
    ARC_SEC;
  const theta =
    ((2004.3109 - 0.8533 * T - 0.000217 * T ** 2) * t - (0.42665 + 0.000217 * T) * t ** 2 - 0.041833 * t ** 3) *
    ARC_SEC;
  return ({ ra, dec }) => {
    const a = Math.cos(dec * DEG) * Math.sin(ra * DEG + zeta);
    const b = Math.cos(theta) * Math.cos(dec * DEG) * Math.cos(ra * DEG + zeta) - Math.sin(theta) * Math.sin(dec * DEG);
    const c = Math.sin(theta) * Math.cos(dec * DEG) * Math.cos(ra * DEG + zeta) + Math.cos(theta) * Math.sin(dec * DEG);
    return { ra: normalizeRa((Math.atan2(a, b) + z) / DEG), dec: Math.asin(c) / DEG };
  };
};
const precessFromB1875 = precess(B1875, J2000);

/** `hh:mm:ss` to degrees */
const hmsToDeg = hms => hms.split(':').reduce((value, part, index) => value + Number(part) * 15 * 60 ** -index, 0);
/** `±dd:mm:ss` to degrees */
const dmsToDeg = dms =>
  (dms.startsWith('-') ? -1 : 1) *
  dms
    .slice(1)
    .split(':')
    .reduce((value, part, index) => value + Number(part) * 60 ** -index, 0);

/**
 * An edge of B1875, e.g. `001:002 M+ 22:52:00 +34:30:00 22:52:00 +52:30:00 AND LAC`, along a meridian (M) or a
 * parallel (P): one of its coordinates is constant, the other is interpolated
 */
const toBoundaryEdge = edge => {
  const [, , ra1, dec1, ra2, dec2, constellation1, constellation2] = edge.split(/\s+/);
  const from = { ra: hmsToDeg(ra1), dec: dmsToDeg(dec1) };
  const to = { ra: hmsToDeg(ra2), dec: dmsToDeg(dec2) };
  // the shorter way, e.g. from 23:35 to 00:10
  const deltaRa = ((to.ra - from.ra + 540) % 360) - 180;
  const deltaDec = to.dec - from.dec;
  const stepCount = Math.max(
    1,
    Math.ceil(Math.hypot(deltaRa * Math.cos(((from.dec + to.dec) / 2) * DEG), deltaDec) / MAX_EDGE_STEP)
  );
  return {
    constellations: [toConstellation(constellation1), toConstellation(constellation2)],
    points: Array.from({ length: stepCount + 1 }, (_, step) =>
      precessFromB1875({ ra: from.ra + (deltaRa * step) / stepCount, dec: from.dec + (deltaDec * step) / stepCount })
    ).flatMap(({ ra, dec }) => [round(ra * DEG), round(dec * DEG)])
  };
};

/** The brightest star of each Hipparcos number (the components of a double may share one) */
const getHipparcosStars = stars =>
  stars.reduce(
    (byHip, star) =>
      star.hip !== undefined && !(byHip.get(star.hip)?.magnitude <= star.magnitude) ? byHip.set(star.hip, star) : byHip,
    new Map()
  );

const getLines = (skyCulture, stars) => {
  const hipparcosStars = getHipparcosStars(stars);
  const missing = skyCulture.constellations
    .flatMap(({ lines }) => lines.flat())
    .filter(hip => !hipparcosStars.has(hip));
  if (missing.length) throw new Error(`Stars of the lines missing from the layers: HIP ${missing.join(', ')}`);
  return Object.fromEntries(
    skyCulture.constellations.map(({ id, lines }) => [
      // e.g. `CON modern Ori`
      toConstellation(id.split(' ').at(-1)),
      lines.map(line =>
        line.flatMap(hip => {
          const { ra, dec } = hipparcosStars.get(hip);
          return [round(ra * DEG), round(dec * DEG)];
        })
      )
    ])
  );
};

const skyCulture = await (await fetchOk(SKY_CULTURE_SOURCE)).json();
if (skyCulture.edges_type !== 'iau' || skyCulture.edges_epoch !== 'B1875')
  throw new Error(`Unexpected boundaries: ${skyCulture.edges_type}, ${skyCulture.edges_epoch}`);

// one file at a time, not to strain CDS
const stars = [];
for (const file of MAIN_FILES) stars.push(...(await readStars(file, readMainStar)));
stars.push(...(await readStars(SUPPLEMENT_FILE, readSupplementStar)));

mkdirSync(starsTarget, { recursive: true });
LAYERS.reduce((minMagnitude, { file, maxMagnitude, bandCount, cellWidth }) => {
  const maxCode = toMagnitudeCode(maxMagnitude);
  const layerStars = stars.filter(({ magnitude }) => magnitude > minMagnitude && magnitude <= maxCode);
  const { data, tileCount, maxTileStars } = encodeLayer(layerStars, getCellCounts(bandCount, cellWidth));
  writeFileSync(join(starsTarget, file), data);
  console.log(
    `${file}: ${layerStars.length} stars in ${tileCount} tiles (at most ${maxTileStars} in one), ${data.length} bytes`
  );
  return maxCode;
}, -Infinity);

mkdirSync(constellationTarget, { recursive: true });
const lines = getLines(skyCulture, stars);
writeFileSync(join(constellationTarget, 'constellation.lines.json'), JSON.stringify(lines) + '\n');
console.log(`constellation.lines.json: ${Object.keys(lines).length} constellations`);
const boundaries = skyCulture.edges.map(toBoundaryEdge);
writeFileSync(join(constellationTarget, 'constellation.boundaries.json'), JSON.stringify(boundaries) + '\n');
console.log(
  `constellation.boundaries.json: ${boundaries.length} edges, ${boundaries.reduce((count, { points }) => count + points.length / 2, 0)} points`
);
