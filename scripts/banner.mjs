/**
 * Renders the banner of the shared links (Open Graph, `index.html`): the icon, the name, a tagline and the address on
 * the left, the star map of the running app on the right (M31 at a fixed night, north up, fading into the black under
 * the text). Puppeteer drives the local Chrome: the map is shot from the app, the banner from an HTML page around it.
 * The social sites keep the image for weeks, so a changed banner needs a new file name (and `index.html` with it).
 *
 * Usage: node scripts/banner.mjs [app URL, default http://localhost:5173] (with `npm run dev` running); CHROME= the
 * path of Chrome if not the default one of macOS
 *
 * Output: public/og.jpg (1200×630)
 */

import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appUrl = process.argv[2] ?? 'http://localhost:5173';
const chrome = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const WIDTH = 1200;
const HEIGHT = 630;
/** Of the map, on the right */
const MAP_WIDTH = 720;
/** Rendered at twice the size, then scaled down */
const SCALE = 2;
const QUALITY = 85;
/** M31 at 22:00 of 2026-10-12 in Hungary, north up; the time label of its corner hidden */
const MAP_PATH = '/m31/map?date=2026-10-12&lng=19&lat=47&orient=eq&ra=12&dec=40.3&fov=13&t=1791835200';
/** The header and the toolbar of the drawer around the map (CSS pixels) */
const MAP_CHROME_HEIGHT = 107;
const TAGLINE = 'Finds what to observe on a given night: deep-sky objects, planets and the Moon, with a star map';
const ADDRESS = 'astroffers.hasyee.com';

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

const shootMap = async browser => {
  const page = await browser.newPage();
  // the drawer of a wide screen (880px), its map as high as the banner
  await page.setViewport({ width: 1600, height: HEIGHT + MAP_CHROME_HEIGHT, deviceScaleFactor: SCALE });
  await page.goto(appUrl + MAP_PATH);
  await page.waitForSelector('.StarMap canvas', { timeout: 30000 });
  await page.addStyleTag({ content: '.StarMap .time { display: none }' });
  // the stars, the Moon and the preview loaded
  await wait(3000);
  const box = await page.$eval('.StarMap .sky', element => {
    const { left, top, width, height } = element.getBoundingClientRect();
    return { left, top, width, height };
  });
  const [left, top, width, height] = [box.left, box.top, box.width, box.height].map(value => Math.round(value * SCALE));
  return sharp(await page.screenshot())
    .extract({ left, top, width, height })
    .png()
    .toBuffer();
};

const toHtml = map => {
  const icon = readFileSync(join(root, 'public/icons/icon-512x512.png')).toString('base64');
  const font = join(root, 'node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2');
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      @font-face { font-family: Inter; src: url('file://${font}') format('woff2'); font-weight: 100 900; }
      html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; background: #000; overflow: hidden; font-family: Inter, sans-serif; }
      .map { position: absolute; top: 0; right: 0; width: ${MAP_WIDTH}px; height: ${HEIGHT}px; background: url('data:image/png;base64,${map.toString('base64')}') center / cover; }
      .map::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to right, #000 0%, rgba(0, 0, 0, 0) 35%); }
      .text { position: absolute; left: 72px; top: 0; bottom: 0; width: 520px; display: flex; flex-direction: column; justify-content: center; }
      img { width: 112px; height: 112px; margin-bottom: 36px; }
      h1 { margin: 0; color: #fff; font-size: 76px; font-weight: 700; letter-spacing: -1.5px; }
      p { margin: 18px 0 0; color: rgba(255, 255, 255, 0.7); font-size: 28px; line-height: 1.35; }
      .address { margin-top: 36px; color: #90caf9; font-size: 24px; font-weight: 500; }
    </style>
  </head>
  <body>
    <div class="map"></div>
    <div class="text">
      <img src="data:image/png;base64,${icon}" />
      <h1>Astroffers</h1>
      <p>${TAGLINE}</p>
      <div class="address">${ADDRESS}</div>
    </div>
  </body>
</html>`;
};

const browser = await puppeteer.launch({ executablePath: chrome, headless: true });
try {
  const html = join(mkdtempSync(join(tmpdir(), 'banner-')), 'banner.html');
  writeFileSync(html, toHtml(await shootMap(browser)));
  const page = await browser.newPage();
  await page.setViewport({ width: WIDTH, height: HEIGHT, deviceScaleFactor: SCALE });
  await page.goto(`file://${html}`);
  await page.evaluate(() => document.fonts.ready);
  await sharp(await page.screenshot())
    .resize(WIDTH, HEIGHT)
    .jpeg({ quality: QUALITY, mozjpeg: true })
    .toFile(join(root, 'public/og.jpg'));
  console.log('public/og.jpg');
} finally {
  await browser.close();
}
