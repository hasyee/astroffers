import { timeToLst } from '../calculator/calculator.lst';
import { toNextDay, toNoon } from '../calculator/calculator.time';
import { getElapsedYearsSinceJ2000, getEqCoordsOnDate } from '../calculator/calculator.precession';
import type * as Astronomy from 'astronomy-engine';
import type { Eq, NgcInfo, NgcObject, Radians, Timestamp } from '../calculator/calculator.types';
import { getLocation } from '../calculator/calculator.units';
import { CONSTELLATION_LINES } from '../constellation/constellation.utils';
import type { Coords } from '../location/location.types';
import { type ParamValues, createBoolParam, createEnumParam, createNumParam } from '../query/query.params';
import { type Orientation, type Point, type Size, type View, createProjection, projectEq } from './starmap.projection';
import { addScaled, cross, dot, normalize, toEq, toVector } from './starmap.vector';

/**
 * Query params of the orientation of the star map, as a telescope shows the sky, in the query on its route only:
 * `fh=1` mirrors it horizontally, `fv=1` vertically
 */
export const FLIP_PARAMS = {
  horizontal: createBoolParam('fh'),
  vertical: createBoolParam('fv')
};

/**
 * Query param of the point of the sky up on the star map, on its route only: the zenith (`azimuthal`, the default, as
 * the sky is seen), or the north celestial pole (`orient=eq`, as a telescope on an equatorial mount moves)
 */
export const ORIENTATION_PARAM = createEnumParam('orient', { azimuthal: 'az', equatorial: 'eq' }, 'azimuthal');

export const NORTH_CELESTIAL_POLE: Eq = { ra: 0, de: Math.PI / 2 };

const DEG = Math.PI / 180;

/** The range of the zoom, degrees */
const MIN_FOV_DEG = 1;
const MAX_FOV_DEG = 120;
const MIN_FOV = MIN_FOV_DEG * DEG;
const MAX_FOV = MAX_FOV_DEG * DEG;

/**
 * Query params of the view of the star map, on its route only (a link to the map shows the same), in degrees: its
 * center (`ra`, `dec`) and its field of view (`fov`); without them the map opens around the object
 * (`getInitialView`). Not stored: the next map is of another object.
 */
export const VIEW_PARAMS = {
  ra: createNumParam('ra', null, { min: 0, max: 360 }),
  dec: createNumParam('dec', null, { min: -90, max: 90 }),
  fov: createNumParam('fov', null, { min: MIN_FOV_DEG, max: MAX_FOV_DEG })
};

const round = (decimals: number) => (value: number) => Math.round(value * 10 ** decimals) / 10 ** decimals;

export const toView = ({ ra, dec, fov }: ParamValues<typeof VIEW_PARAMS>): View | null =>
  ra !== null && dec !== null && fov !== null ? { center: { ra: ra * DEG, de: dec * DEG }, fov: fov * DEG } : null;

/** To 0.001° (3.6″) the center, to 0.01° the field of view */
export const toViewParamValues = ({ center, fov }: View): ParamValues<typeof VIEW_PARAMS> => ({
  ra: round(3)((((center.ra / DEG) % 360) + 360) % 360),
  dec: round(3)(center.de / DEG),
  fov: round(2)(fov / DEG)
});
/** The range of the field of view of the map opened (`getInitialFov`) */
const MIN_INITIAL_FOV = 20 * DEG;
const MAX_INITIAL_FOV = 90 * DEG;
/** Room around the lines of the constellation */
const INITIAL_FOV_MARGIN = 1.15;

/** The faintest stars of the layers */
const MAX_MAGNITUDE = 10;
/** CSS pixels */
const MIN_STAR_RADIUS = 0.6;
const MAX_STAR_RADIUS = 5;
const STAR_RADIUS_PER_MAGNITUDE = 0.45;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const getDistance = (a: Eq, b: Eq): Radians =>
  Math.acos(clamp(Math.sin(a.de) * Math.sin(b.de) + Math.cos(a.de) * Math.cos(b.de) * Math.cos(a.ra - b.ra), -1, 1));

const toEqs = (line: number[]): Eq[] =>
  Array.from({ length: line.length / 2 }, (_, index) => ({ ra: line[2 * index], de: line[2 * index + 1] }));

/** Around the object, the lines of its constellation in it, within a range (Hydra is ~100° long) */
export const getInitialView = (object: NgcObject): View => {
  const distances = (CONSTELLATION_LINES[object.constellation] ?? []).flatMap(toEqs).map(eq => getDistance(object, eq));
  return {
    center: { ra: object.ra, de: object.de },
    fov: clamp(2 * Math.max(0, ...distances) * INITIAL_FOV_MARGIN, MIN_INITIAL_FOV, MAX_INITIAL_FOV)
  };
};

/**
 * Query param of the time of the sky of the star map, on its route only: a Unix timestamp (seconds, UTC). Always in the
 * query there, unlike the other params: the time chosen at the opening (`getOpeningTime`) depends on when the map is
 * opened, so a link carries it to show the same sky.
 */
export const TIME_PARAM = createNumParam('t', null, { min: 0, max: 4102444800 });

export const toTimeParamValue = (time: Timestamp) => Math.round(time / 1000);

/** The object is observable at the time: in its window of the night (above the minimum altitude) */
const isVisibleAt = ({ intersection }: NgcInfo, time: Timestamp) =>
  time >= intersection.start && time <= intersection.end;

/** The best visibility of the object, its transit without one */
export const getBestTime = ({ max, transit }: NgcInfo) => max ?? transit;

/**
 * The time of the map opened without one, as in Stellarium: now when the object is observable now, else its best
 * visibility (else now)
 */
export const getOpeningTime = (ngcInfo: NgcInfo, now: Timestamp) =>
  isVisibleAt(ngcInfo, now) ? now : (getBestTime(ngcInfo) ?? now);

/** The time of the map is still now within it, milliseconds */
const NOW_TOLERANCE = 5 * 60 * 1000;

export const isNowTime = (time: Timestamp, now: Timestamp) => Math.abs(time - now) <= NOW_TOLERANCE;

export const isBestTime = (ngcInfo: NgcInfo, time: Timestamp) => {
  const bestTime = getBestTime(ngcInfo);
  return bestTime !== null && toTimeParamValue(bestTime) === toTimeParamValue(time);
};

/** The time is in the night of the date (from its noon to the next noon) */
export const isInNight = (time: Timestamp, date: Timestamp) => {
  const noon = toNoon(date);
  return time >= noon && time < toNextDay(noon);
};

/**
 * The horizon of the place at a time, J2000: its zenith and nadir, and its directions (with a point 1° below each, for
 * the side of its label)
 */
export type Horizon = { zenith: Eq; nadir: Eq; directions: { name: string; point: Eq; below: Eq }[] };

/** Azimuths from the north towards the east */
const DIRECTIONS: [name: string, azimuth: number][] = [
  ['N', 0],
  ['E', 90],
  ['S', 180],
  ['W', 270]
];

/** The yearly move of the north celestial pole by the precession, towards 0h (as in `calculator.precession.ts`) */
const POLE_PRECESSION_PER_YEAR = (20.04 / 3600) * DEG;

/**
 * A point of the sky by its horizontal coordinates (the azimuth from the north towards the east), J2000: along the
 * east, the north and the up of the place in J2000 — the zenith of the date precessed back, the north towards the
 * pole of the date (precessing each point back would be imprecise near the poles)
 */
const createHorizontalToEq = (time: Timestamp, coords: Coords) => {
  const { lat, lon } = getLocation(coords.lat, coords.lng);
  const years = getElapsedYearsSinceJ2000(time);
  const up = toVector(getEqCoordsOnDate({ ra: timeToLst(time, lon), de: lat }, -years));
  const pole = toVector({ ra: 0, de: Math.PI / 2 - POLE_PRECESSION_PER_YEAR * years });
  const north = normalize(addScaled(pole, up, -dot(pole, up)));
  const east = cross(north, up);
  return (azimuth: Radians, altitude: Radians) => {
    const horizontal = Math.cos(altitude);
    return toEq(
      addScaled(
        addScaled(addScaled([0, 0, 0], east, horizontal * Math.sin(azimuth)), north, horizontal * Math.cos(azimuth)),
        up,
        Math.sin(altitude)
      )
    );
  };
};

export const getHorizon = (time: Timestamp, coords: Coords): Horizon => {
  const horizontalToEq = createHorizontalToEq(time, coords);
  return {
    zenith: horizontalToEq(0, Math.PI / 2),
    nadir: horizontalToEq(0, -Math.PI / 2),
    directions: DIRECTIONS.map(([name, azimuth]) => ({
      name,
      point: horizontalToEq(azimuth * DEG, 0),
      below: horizontalToEq(azimuth * DEG, -DEG)
    }))
  };
};

/**
 * The Moon of the place at a time, topocentric (its parallax is up to ~1°), J2000: its position, its angular radius,
 * the illuminated fraction of its disc, and the position of the Sun, for the side of its bright limb
 */
export type Moon = { eq: Eq; radius: Radians; illuminated: number; sun: Eq };

const MOON_RADIUS_KM = 1737.4;

/** By `astronomy-engine`, loaded by the map (`useAstronomy`) */
export const getMoon = (astronomy: typeof Astronomy, time: Timestamp, coords: Coords): Moon => {
  const observer = new astronomy.Observer(coords.lat, coords.lng, 0);
  const date = new Date(time);
  const toEq = ({ ra, dec }: Astronomy.EquatorialCoordinates): Eq => ({ ra: (ra / 12) * Math.PI, de: dec * DEG });
  const moon = astronomy.Equator(astronomy.Body.Moon, date, observer, false, true);
  return {
    eq: toEq(moon),
    radius: Math.asin(MOON_RADIUS_KM / (moon.dist * astronomy.KM_PER_AU)),
    illuminated: astronomy.Illumination(astronomy.Body.Moon, date).phase_fraction,
    sun: toEq(astronomy.Equator(astronomy.Body.Sun, date, observer, false, true))
  };
};

/**
 * The faintest stars shown: the more of them the narrower the field (5.1 at 90°, 6.6 at 40°, 8 at 20°, 10 below
 * ~7.5°), few in a wide field, not to hide the constellations
 */
export const getMagnitudeLimit = (fov: Radians) => Math.min(MAX_MAGNITUDE, 3.8 + 4.5 * Math.log10(Math.PI / fov));

/** CSS pixels, by the brightness of the star relative to the faintest ones shown */
export const getStarRadius = (magnitude: number, magnitudeLimit: number) =>
  clamp(MIN_STAR_RADIUS + STAR_RADIUS_PER_MAGNITUDE * (magnitudeLimit - magnitude), MIN_STAR_RADIUS, MAX_STAR_RADIUS);

/**
 * The view moved by a drag (or a pinch) of a point of the canvas to another one, zoomed by the factor of the field of
 * view: the point of the sky under the first one gets under the other one
 */
export const moveView = (view: View, size: Size, orientation: Orientation, from: Point, to: Point, zoom = 1): View => {
  const target = createProjection(view, size, orientation).unproject(from);
  const zoomed = { ...view, fov: clamp(view.fov * zoom, MIN_FOV, MAX_FOV) };
  const projection = createProjection(zoomed, size, orientation);
  const point = projectEq(projection, target);
  return point
    ? {
        ...zoomed,
        center: projection.unproject({ x: size.width / 2 + point.x - to.x, y: size.height / 2 + point.y - to.y })
      }
    : zoomed;
};
