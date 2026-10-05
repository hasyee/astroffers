import {
  Body,
  Constellation,
  EquatorFromVector,
  GeoVector,
  HelioVector,
  Illumination,
  MakeTime,
  Vector
} from 'astronomy-engine';
import type { AstroTime } from 'astronomy-engine';
import type { ArcMin, NgcObject, Timestamp } from '../calculator/calculator.types';
import { degToRad, hoursToRad } from '../calculator/calculator.units';
import minorBodies from './solar.json';
import { photos } from './solar.photos';

const { sin, cos, sqrt, tan, exp, log10, acos, PI } = Math;

/** km */
const AU = 149597870.7;
/** Light time of 1 au in days */
const LIGHT_TIME = 0.0057755183;
/** Obliquity of the ecliptic at J2000 */
const OBLIQUITY = degToRad(23.4392911);
const ARC_MIN_PER_RAD = (180 / PI) * 60;

/** The planets and Pluto, calculated by astronomy-engine; the diameters are equatorial ones in km */
const MAJOR_BODIES: { id: string; name: string; body: Body; type: string; diameter: number }[] = [
  { id: 'mercury', name: 'Mercury', body: Body.Mercury, type: 'Pl', diameter: 4879 },
  { id: 'venus', name: 'Venus', body: Body.Venus, type: 'Pl', diameter: 12104 },
  { id: 'mars', name: 'Mars', body: Body.Mars, type: 'Pl', diameter: 6792 },
  { id: 'jupiter', name: 'Jupiter', body: Body.Jupiter, type: 'Pl', diameter: 142984 },
  // the globe, without the rings
  { id: 'saturn', name: 'Saturn', body: Body.Saturn, type: 'Pl', diameter: 120536 },
  { id: 'uranus', name: 'Uranus', body: Body.Uranus, type: 'Pl', diameter: 51118 },
  { id: 'neptune', name: 'Neptune', body: Body.Neptune, type: 'Pl', diameter: 49528 },
  { id: 'pluto', name: 'Pluto', body: Body.Pluto, type: 'DPl', diameter: 2377 }
];

type MinorBody = (typeof minorBodies)[number];
type Xyz = [x: number, y: number, z: number];

const round1 = (value: number) => Math.round(value * 10) / 10;

const length = ([x, y, z]: Xyz) => sqrt(x * x + y * y + z * z);

const subtract = ([x1, y1, z1]: Xyz, [x2, y2, z2]: Xyz): Xyz => [x1 - x2, y1 - y2, z1 - z2];

const toJulianDate = (time: Timestamp) => time / 86400000 + 2440587.5;

/** The eccentric anomaly of a mean anomaly by Newton's method */
const solveKepler = (meanAnomaly: number, e: number) => {
  let E = e < 0.8 ? meanAnomaly : PI;
  for (let i = 0; i < 20; i++) {
    const delta = (E - e * sin(E) - meanAnomaly) / (1 - e * cos(E));
    E -= delta;
    if (Math.abs(delta) < 1e-12) break;
  }
  return E;
};

/**
 * Heliocentric position (equatorial J2000, au) of a minor body at a Julian date, propagated on its osculating
 * orbit from the epoch of its elements, without the perturbations of the planets
 */
const getHelioPosition = ({ elements: { epoch, a, e, i, om, w, ma, n } }: MinorBody, julianDate: number): Xyz => {
  const E = solveKepler(degToRad(ma + n * (julianDate - epoch)), e);
  // in the plane of the orbit, the perihelion on the x axis
  const xv = a * (cos(E) - e);
  const yv = a * sqrt(1 - e * e) * sin(E);
  const [sinO, cosO] = [sin(degToRad(om)), cos(degToRad(om))];
  const [sinW, cosW] = [sin(degToRad(w)), cos(degToRad(w))];
  const [sinI, cosI] = [sin(degToRad(i)), cos(degToRad(i))];
  // ecliptic J2000
  const x = (cosO * cosW - sinO * sinW * cosI) * xv + (-cosO * sinW - sinO * cosW * cosI) * yv;
  const y = (sinO * cosW + cosO * sinW * cosI) * xv + (-sinO * sinW + cosO * cosW * cosI) * yv;
  const z = sinW * sinI * xv + cosW * sinI * yv;
  return [x, y * cos(OBLIQUITY) - z * sin(OBLIQUITY), y * sin(OBLIQUITY) + z * cos(OBLIQUITY)];
};

/** Magnitude of the H, G system from the distances to the Sun and to the Earth and the phase angle */
const getMinorMagnitude = ({ H, G }: MinorBody, sunDistance: number, earthDistance: number, phaseAngle: number) => {
  const phi1 = exp(-3.33 * tan(phaseAngle / 2) ** 0.63);
  const phi2 = exp(-1.87 * tan(phaseAngle / 2) ** 1.22);
  return H + 5 * log10(sunDistance * earthDistance) - 2.5 * log10((1 - G) * phi1 + G * phi2);
};

const getSize = (diameter: number, distance: number): [ArcMin, ArcMin] => {
  const size = (diameter / (distance * AU)) * ARC_MIN_PER_RAD;
  return [size, size];
};

/** As in the catalog (`scripts/catalog.mjs`) */
const getSurfaceBrightness = (magnitude: number, [a, b]: [ArcMin, ArcMin]) =>
  round1(magnitude + 2.5 * log10((PI / 4) * a * b));

const toObject = (
  { id, name, type, diameter, skySource }: { id: string; name: string; type: string; diameter: number; skySource: string },
  geocentric: Vector,
  magnitude: number
): NgcObject => {
  const { ra, dec, dist } = EquatorFromVector(geocentric);
  const size = getSize(diameter, dist);
  return {
    id,
    name,
    ra: hoursToRad(ra),
    de: degToRad(dec),
    constellation: Constellation(ra, dec).symbol,
    size,
    magnitude: round1(magnitude),
    surfaceBrightness: getSurfaceBrightness(magnitude, size),
    types: [type],
    photo: photos[id],
    skySource
  };
};

const getMajorObject = (body: (typeof MAJOR_BODIES)[number], time: AstroTime) =>
  toObject({ ...body, skySource: body.name }, GeoVector(body.body, time, true), Illumination(body.body, time).mag);

const getMinorObject = (body: MinorBody, time: AstroTime, earth: Xyz, julianDate: number) => {
  // corrected for the light time: the position where the body was when its light left it
  let helio = getHelioPosition(body, julianDate);
  for (let i = 0; i < 2; i++) {
    helio = getHelioPosition(body, julianDate - length(subtract(helio, earth)) * LIGHT_TIME);
  }
  const geo = subtract(helio, earth);
  const [sunDistance, earthDistance, earthSunDistance] = [length(helio), length(geo), length(earth)];
  const phaseAngle = acos(
    (sunDistance ** 2 + earthDistance ** 2 - earthSunDistance ** 2) / (2 * sunDistance * earthDistance)
  );
  return toObject(
    // by the provisional designation: some names are of other objects in Stellarium Web (e.g. Iris, Metis)
    { ...body, skySource: body.designation },
    new Vector(...geo, time),
    getMinorMagnitude(body, sunDistance, earthDistance, phaseAngle)
  );
};

/**
 * The planets, the dwarf planets and the brightest asteroids as objects of the catalog at the given time, with
 * their J2000 coordinates, constellation, size, magnitude and surface brightness of then (they move: calculated
 * once a night, for its middle)
 */
export const getSolarSystemObjects = (time: Timestamp): NgcObject[] => {
  const astroTime = MakeTime(new Date(time));
  const { x, y, z } = HelioVector(Body.Earth, astroTime);
  const earth: Xyz = [x, y, z];
  const julianDate = toJulianDate(time);
  return [
    ...MAJOR_BODIES.map(body => getMajorObject(body, astroTime)),
    ...minorBodies.map(body => getMinorObject(body, astroTime, earth, julianDate))
  ];
};
