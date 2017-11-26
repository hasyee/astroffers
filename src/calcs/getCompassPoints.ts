import { radToDeg, degToRad, PI2 } from './units';
import { Timestamp, Az, Rad, CoordSeries } from './types';

type AzPoint = {
  time: Timestamp;
  coord: Az;
};

const { abs } = Math;

const NORTH = degToRad(0);
const EAST = degToRad(90);
const SOUTH = degToRad(180);
const WEST = degToRad(270);

const normalizeAz = (az: Rad) => (az > PI2 ? az - PI2 : az);

const diff = (a: Rad, b: Rad) => abs(a - b);

const getClosest = (horizontalCoords: CoordSeries<Az>, direction: Rad): AzPoint =>
  horizontalCoords.reduce(
    (acc, point) =>
      diff(normalizeAz(point.coord.az), direction) < diff(normalizeAz(acc.coord.az), direction) ? point : acc,
    { time: Infinity, coord: { az: Infinity, alt: Infinity } }
  );

export default (
  horizontalCoords: CoordSeries<Az>
): { north: AzPoint; east: AzPoint; south: AzPoint; west: AzPoint } => ({
  north: getClosest(horizontalCoords, NORTH),
  east: getClosest(horizontalCoords, EAST),
  south: getClosest(horizontalCoords, SOUTH),
  west: getClosest(horizontalCoords, WEST)
});
