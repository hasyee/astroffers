/**
 * Renders the preview images of the catalog's objects from the DSS2 survey by the hips2fits service of CDS
 * (Strasbourg), to be served from S3 (`images/` of the `astroffers` bucket) instead: hips2fits renders each image on
 * request, which takes up to half a minute now and then. They are re-encoded as grayscale JPEGs (shown in grayscale
 * anyway; mozjpeg q70, ~6 KB each, half of hips2fits' color JPEGs, no visible difference). A few requests at a time;
 * the images already there are skipped, so an interrupted run continues where it stopped (delete them to render them
 * again).
 *
 * Usage: node scripts/previews.mjs
 *
 * Output: images/<id>.preview.jpg (git-ignored, beside the photos of the Solar System's bodies), as the keys of the
 * bucket
 */

import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'images');
const catalog = JSON.parse(readFileSync(join(root, 'src/catalog/catalog.json'), 'utf8'));

/** Pixels of the preview, the same for the details, the cards and the table */
const SIZE = 300;
const QUALITY = 70;
/** Arc minutes */
const MIN_FIELD_OF_VIEW = 6;
const MAX_FIELD_OF_VIEW = 180;
/** Requests at a time */
const CONCURRENCY = 4;
const RETRIES = 3;

/** Field of view of the preview image: the object with some margin around it */
const getFieldOfView = size =>
  Math.min(MAX_FIELD_OF_VIEW, Math.max(MIN_FIELD_OF_VIEW, size ? Math.max(...size) * 1.5 : 0));

const toDegrees = radians => (radians * 180) / Math.PI;

const getUrl = ({ ra, de, size }) => {
  const params = new URLSearchParams({
    hips: 'CDS/P/DSS2/color',
    width: String(SIZE),
    height: String(SIZE),
    fov: (getFieldOfView(size) / 60).toFixed(3),
    projection: 'TAN',
    coordsys: 'icrs',
    ra: toDegrees(ra).toFixed(5),
    dec: toDegrees(de).toFixed(5),
    // lossless, to be encoded once only
    format: 'png'
  });
  return `https://alasky.cds.unistra.fr/hips-image-services/hips2fits?${params}`;
};

const render = async object => {
  const response = await fetch(getUrl(object));
  if (!response.ok) throw new Error(`${response.status}`);
  const png = Buffer.from(await response.arrayBuffer());
  return sharp(png).grayscale().jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
};

const renderWithRetries = async object => {
  for (let attempt = 1; ; attempt++) {
    try {
      return await render(object);
    } catch (error) {
      if (attempt === RETRIES) throw error;
      await new Promise(resolve => setTimeout(resolve, attempt * 5000));
    }
  }
};

mkdirSync(target, { recursive: true });
const getFile = ({ id }) => join(target, `${id}.preview.jpg`);
const pending = catalog.filter(object => !existsSync(getFile(object)));
console.log(`${catalog.length - pending.length} of ${catalog.length} done already, rendering ${pending.length}`);

const failed = [];
let done = 0;
let next = 0;
const worker = async () => {
  while (next < pending.length) {
    const object = pending[next++];
    const file = getFile(object);
    try {
      // written under another name first, not to leave a partial image behind when interrupted
      writeFileSync(`${file}.tmp`, await renderWithRetries(object));
      renameSync(`${file}.tmp`, file);
    } catch (error) {
      failed.push(object.id);
      console.error(`${object.id}: ${error.message}`);
    }
    if (++done % 100 === 0) console.log(`${done} / ${pending.length}`);
  }
};
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

console.log(`${done - failed.length} rendered into ${target}`);
if (failed.length) {
  console.log(`${failed.length} failed (run it again for them): ${failed.join(', ')}`);
  process.exitCode = 1;
}
