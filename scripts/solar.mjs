/**
 * Fetches the orbital elements of the dwarf planets (but Pluto, which astronomy-engine calculates) and of the
 * brightest asteroids from the Small-Body Database of JPL. Rerun it now and then: the osculating elements are
 * propagated without the perturbations of the planets, which drift slowly from the epoch.
 *
 * Usage: node scripts/solar.mjs
 *
 * Output: src/solar/solar.json (the provisional designation; heliocentric ecliptic J2000 elements, angles in degrees,
 * distances in au, the epoch as a Julian date; the H, G magnitude parameters and the diameter in km)
 */

import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const target = join(root, 'src/solar/solar.json');

/** The slope parameter of the H, G magnitude system when JPL gives none */
const DEFAULT_G = 0.15;

/**
 * The bodies by their number in the Minor Planet Center; the diameters missing from JPL (the trans-Neptunian dwarf
 * planets) are the mean ones of their discoveries' measurements
 */
const BODIES = [
  { number: 1, id: 'ceres', name: 'Ceres', type: 'DPl' },
  { number: 136199, id: 'eris', name: 'Eris', type: 'DPl', diameter: 2326 },
  { number: 136472, id: 'makemake', name: 'Makemake', type: 'DPl', diameter: 1430 },
  { number: 136108, id: 'haumea', name: 'Haumea', type: 'DPl', diameter: 1560 },
  // the asteroids getting brighter than about magnitude 9 at their oppositions
  { number: 4, id: 'vesta', name: 'Vesta', type: 'MPl' },
  { number: 2, id: 'pallas', name: 'Pallas', type: 'MPl' },
  { number: 3, id: 'juno', name: 'Juno', type: 'MPl' },
  { number: 7, id: 'iris', name: 'Iris', type: 'MPl' },
  { number: 6, id: 'hebe', name: 'Hebe', type: 'MPl' },
  { number: 18, id: 'melpomene', name: 'Melpomene', type: 'MPl' },
  { number: 15, id: 'eunomia', name: 'Eunomia', type: 'MPl' },
  { number: 8, id: 'flora', name: 'Flora', type: 'MPl' },
  { number: 9, id: 'metis', name: 'Metis', type: 'MPl' },
  { number: 10, id: 'hygiea', name: 'Hygiea', type: 'MPl' }
];

const fetchBody = async ({ number, diameter, ...body }) => {
  const response = await fetch(`https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=${number}&phys-par=1&full-prec=1`);
  if (!response.ok) throw new Error(`${body.name}: ${response.status}`);
  const { object, orbit, phys_par: physical = [] } = await response.json();
  const element = name => Number(orbit.elements.find(element => element.name === name).value);
  const parameter = name => {
    const value = physical.find(parameter => parameter.name === name)?.value;
    return value === undefined ? undefined : Number(value);
  };
  return {
    ...body,
    number,
    // e.g. `A847 PA` of `7 Iris (A847 PA)`: Stellarium Web finds the asteroid by it, by its name only a satellite
    designation: object.fullname.match(/\((.+)\)/)[1],
    H: parameter('H'),
    G: parameter('G') ?? DEFAULT_G,
    diameter: diameter ?? parameter('diameter'),
    elements: {
      epoch: Number(orbit.epoch),
      a: element('a'),
      e: element('e'),
      i: element('i'),
      om: element('om'),
      w: element('w'),
      ma: element('ma'),
      n: element('n')
    }
  };
};

// one by one: the API refuses parallel requests (503)
const bodies = [];
for (const body of BODIES) bodies.push(await fetchBody(body));
writeFileSync(target, JSON.stringify(bodies, null, 2) + '\n');
console.log(`${bodies.length} bodies written to ${target}`);
