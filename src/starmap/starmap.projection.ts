import type { Eq, Radians } from '../calculator/calculator.types';

/** The center of the map and its field of view across the shorter side of the canvas */
export type View = { center: Eq; fov: Radians };

/** Device pixels */
export type Size = { width: number; height: number };

export type Point = { x: number; y: number };

export type Flip = { horizontal: boolean; vertical: boolean };

/**
 * The point of the sky the map is turned to, up from the center: the zenith (as the sky is seen), or the north
 * celestial pole (as a telescope on an equatorial mount moves); and the flips, mirroring it as a telescope does
 */
export type Orientation = { up: Eq; flip: Flip };

export type Projection = {
  /** Device pixels per unit of the projection plane (the radius of a small circle of the sky is about its angle) */
  scale: number;
  /** The angle from the center to the corners of the canvas */
  radius: Radians;
  /**
   * The point of the canvas of a position of the sky, by the sine and the cosine of its declination; null farther
   * from the center than the angle whose cosine is the minimum (not to project the far side, near the antipode)
   */
  project: (ra: Radians, sinDe: number, cosDe: number, minCos?: number) => Point | null;
  unproject: (point: Point) => Eq;
};

/** Far side of the sky, not projected: farther than ~154° from the center */
const FAR_SIDE_COS = -0.9;

/** The angle of the direction to the point from the center, from the north towards the east */
const getPositionAngle = (center: Eq, { ra, de }: Eq) =>
  Math.atan2(
    Math.cos(de) * Math.sin(ra - center.ra),
    Math.cos(center.de) * Math.sin(de) - Math.sin(center.de) * Math.cos(de) * Math.cos(ra - center.ra)
  );

/**
 * Stereographic projection (conformal: the shapes of the constellations are kept in a wide field too), east to the
 * left of the north, as the sky is seen, turned to the point of the orientation up, then flipped
 */
export const createProjection = (
  { center, fov }: View,
  { width, height }: Size,
  { up, flip }: Orientation
): Projection => {
  const sinDe0 = Math.sin(center.de);
  const cosDe0 = Math.cos(center.de);
  const scale = Math.min(width, height) / 2 / (2 * Math.tan(fov / 4));
  // the plane turned by the position angle of the point up, so the direction to it gets up
  const upAngle = getPositionAngle(center, up);
  const sinUp = Math.sin(upAngle);
  const cosUp = Math.cos(upAngle);
  // screen pixels per unit, to the right and up of the turned plane (the east to the left)
  const rightScale = flip.horizontal ? scale : -scale;
  const upScale = flip.vertical ? scale : -scale;
  const centerX = width / 2;
  const centerY = height / 2;

  return {
    scale,
    radius: 2 * Math.atan(Math.hypot(width, height) / 2 / scale / 2),
    project: (ra, sinDe, cosDe, minCos = FAR_SIDE_COS) => {
      const deltaRa = ra - center.ra;
      const cosDeltaRa = Math.cos(deltaRa);
      const cosDistance = sinDe0 * sinDe + cosDe0 * cosDe * cosDeltaRa;
      if (cosDistance < minCos) return null;
      const k = 2 / (1 + cosDistance);
      const east = k * cosDe * Math.sin(deltaRa);
      const north = k * (cosDe0 * sinDe - sinDe0 * cosDe * cosDeltaRa);
      return {
        x: centerX + rightScale * (east * cosUp - north * sinUp),
        y: centerY + upScale * (east * sinUp + north * cosUp)
      };
    },
    unproject: ({ x, y }) => {
      const right = (x - centerX) / rightScale;
      const upward = (y - centerY) / upScale;
      const east = right * cosUp + upward * sinUp;
      const north = upward * cosUp - right * sinUp;
      const rho = Math.hypot(east, north);
      if (rho === 0) return center;
      const distance = 2 * Math.atan(rho / 2);
      const sinDistance = Math.sin(distance);
      const cosDistance = Math.cos(distance);
      return {
        ra: center.ra + Math.atan2(east * sinDistance, rho * cosDe0 * cosDistance - north * sinDe0 * sinDistance),
        de: Math.asin(cosDistance * sinDe0 + (north * sinDistance * cosDe0) / rho)
      };
    }
  };
};

export const projectEq = (projection: Projection, { ra, de }: Eq) => projection.project(ra, Math.sin(de), Math.cos(de));
