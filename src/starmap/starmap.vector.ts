import type { Eq } from '../calculator/calculator.types';

/** A unit vector of a direction of the sky (and the sums of them on the way to one) */
export type Vector = [number, number, number];

export const toVector = ({ ra, de }: Eq): Vector => [
  Math.cos(de) * Math.cos(ra),
  Math.cos(de) * Math.sin(ra),
  Math.sin(de)
];

export const toEq = ([x, y, z]: Vector): Eq => ({ ra: Math.atan2(y, x), de: Math.asin(Math.min(1, Math.max(-1, z))) });

export const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

export const cross = (a: Vector, b: Vector): Vector => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];

/** `a + factor × b` */
export const addScaled = (a: Vector, b: Vector, factor: number): Vector => [
  a[0] + factor * b[0],
  a[1] + factor * b[1],
  a[2] + factor * b[2]
];

export const normalize = (a: Vector): Vector => {
  const length = Math.hypot(...a);
  return [a[0] / length, a[1] / length, a[2] / length];
};
