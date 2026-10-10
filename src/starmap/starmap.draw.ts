import type { Eq, NgcObject } from '../calculator/calculator.types';
import { CONSTELLATION_LINES } from '../constellation/constellation.utils';
import { type StarLayer, getTilesAround } from '../stars/stars.utils';
import theme from '../theme/theme';
import {
  type Orientation,
  type Projection,
  type Size,
  type View,
  createProjection,
  projectEq
} from './starmap.projection';
import { getMagnitudeLimit, getStarRadius } from './starmap.utils';

const BACKGROUND = theme.palette.background.default;
const STAR = theme.palette.common.white;
const LINE = 'rgba(255, 255, 255, 0.55)';
const MARKER = theme.palette.primary.main;
/** Darker than in the altitude chart (`chart.colors.ts`), over the stars */
const BELOW_HORIZON = 'rgba(128, 128, 128, 0.3)';

/** CSS pixels */
const LINE_WIDTH = 1.25;
const MARKER_WIDTH = 1.5;
const MIN_MARKER_RADIUS = 10;
const MARKER_MARGIN = 4;

/** The faintest stars of the first layer: the second one is needed only beyond them */
const FIRST_LAYER_MAX_MAGNITUDE = 6.5;

export type StarMapScene = {
  view: View;
  size: Size;
  /** Device pixels per CSS pixel */
  pixelRatio: number;
  orientation: Orientation;
  /** Missing while loading */
  layers: StarLayer[] | null;
  object: NgcObject;
  /** Of the place now */
  zenith: Eq;
};

type Vector = [number, number, number];

const toVector = ({ ra, de }: Eq): Vector => [Math.cos(de) * Math.cos(ra), Math.cos(de) * Math.sin(ra), Math.sin(de)];

const toEq = ([x, y, z]: Vector): Eq => ({ ra: Math.atan2(y, x), de: Math.asin(Math.min(1, Math.max(-1, z))) });

const dot = (a: Vector, b: Vector) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const cross = (a: Vector, b: Vector): Vector => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0]
];

/** `a + factor × b` */
const addScaled = (a: Vector, b: Vector, factor: number): Vector => [
  a[0] + factor * b[0],
  a[1] + factor * b[1],
  a[2] + factor * b[2]
];

const normalize = (a: Vector): Vector => {
  const length = Math.hypot(...a);
  return [a[0] / length, a[1] / length, a[2] / length];
};

const drawLines = (context: CanvasRenderingContext2D, projection: Projection, pixelRatio: number) => {
  context.strokeStyle = LINE;
  context.lineWidth = LINE_WIDTH * pixelRatio;
  context.beginPath();
  Object.values(CONSTELLATION_LINES).forEach(lines =>
    lines.forEach(line => {
      // segment by segment, a segment of a star on the far side is left out
      for (let index = 2; index < line.length; index += 2) {
        const from = projectEq(projection, { ra: line[index - 2], de: line[index - 1] });
        const to = projectEq(projection, { ra: line[index], de: line[index + 1] });
        if (from && to) {
          context.moveTo(from.x, from.y);
          context.lineTo(to.x, to.y);
        }
      }
    })
  );
  context.stroke();
};

const drawStars = (
  context: CanvasRenderingContext2D,
  projection: Projection,
  { view, size, pixelRatio, layers }: StarMapScene
) => {
  const magnitudeLimit = getMagnitudeLimit(view.fov);
  const minCos = Math.cos(projection.radius);
  context.fillStyle = STAR;
  context.beginPath();
  (layers ?? [])
    .filter((_, index) => index === 0 || magnitudeLimit > FIRST_LAYER_MAX_MAGNITUDE)
    .forEach(layer =>
      getTilesAround(layer, view.center, projection.radius).forEach(tile => {
        for (let index = layer.tileStarts[tile]; index < layer.tileStarts[tile + 1]; index++) {
          if (layer.magnitude[index] > magnitudeLimit) continue;
          const point = projection.project(layer.ra[index], layer.sinDe[index], layer.cosDe[index], minCos);
          if (!point || point.x < 0 || point.y < 0 || point.x > size.width || point.y > size.height) continue;
          const radius = getStarRadius(layer.magnitude[index], magnitudeLimit) * pixelRatio;
          context.moveTo(point.x + radius, point.y);
          context.arc(point.x, point.y, radius, 0, 2 * Math.PI);
        }
      })
    );
  context.fill();
};

/** Beyond it the circle of the horizon is drawn as a straight line (device pixels) */
const MAX_HORIZON_RADIUS = 1e7;

/**
 * The sky below the horizon covered in faint grey, like in the altitude chart. The stereographic projection maps the
 * horizon to a circle (a line through the center when the center is on the horizon): through three of its points
 * within 90° of the center (not on the far side), the nearest one to the center and two 90° from it along the horizon.
 * A point just below the horizon near the center tells which side of it to cover.
 */
const drawBelowHorizon = (
  context: CanvasRenderingContext2D,
  projection: Projection,
  { view, size, zenith }: StarMapScene
) => {
  const up = toVector(zenith);
  const center = toVector(view.center);
  const towardsCenter = addScaled(center, up, -dot(center, up));
  // any point of the horizon when the center is the zenith or the nadir
  const nearest = normalize(Math.hypot(...towardsCenter) > 1e-9 ? towardsCenter : cross(up, [0, 0, 1]));
  const side = cross(up, nearest);
  const points = [nearest, side, addScaled([0, 0, 0], side, -1)].map(vector => projectEq(projection, toEq(vector)));
  const below = projectEq(projection, toEq(normalize(addScaled(nearest, up, -0.1))));
  const [a, b, c] = points;
  if (!a || !b || !c || !below) return;

  context.fillStyle = BELOW_HORIZON;
  context.beginPath();
  const determinant = 2 * (a.x * (b.y - c.y) + b.x * (c.y - a.y) + c.x * (a.y - b.y));
  const squares = [a, b, c].map(({ x, y }) => x * x + y * y);
  const circleX = (squares[0] * (b.y - c.y) + squares[1] * (c.y - a.y) + squares[2] * (a.y - b.y)) / determinant;
  const circleY = (squares[0] * (c.x - b.x) + squares[1] * (a.x - c.x) + squares[2] * (b.x - a.x)) / determinant;
  const radius = Math.hypot(a.x - circleX, a.y - circleY);
  if (Number.isFinite(radius) && radius < MAX_HORIZON_RADIUS) {
    const isBelowInside = Math.hypot(below.x - circleX, below.y - circleY) < radius;
    if (!isBelowInside) context.rect(0, 0, size.width, size.height);
    context.arc(circleX, circleY, radius, 0, 2 * Math.PI);
    context.fill('evenodd');
  } else {
    // the half-plane of the line through the two points beside the center, on the side of the point below
    const length = Math.hypot(c.x - b.x, c.y - b.y);
    const [alongX, alongY] = [(c.x - b.x) / length, (c.y - b.y) / length];
    const sign = Math.sign(-alongY * (below.x - b.x) + alongX * (below.y - b.y));
    const far = 2 * (size.width + size.height);
    const corners = [
      [b.x - alongX * far, b.y - alongY * far],
      [b.x + alongX * far, b.y + alongY * far],
      [b.x + alongX * far - sign * alongY * far, b.y + alongY * far + sign * alongX * far],
      [b.x - alongX * far - sign * alongY * far, b.y - alongY * far + sign * alongX * far]
    ];
    corners.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)));
    context.fill();
  }
};

/** A ring around the object, at least as large as the object */
const drawMarker = (
  context: CanvasRenderingContext2D,
  projection: Projection,
  { pixelRatio, object }: StarMapScene
) => {
  const point = projectEq(projection, object);
  if (!point) return;
  const size = object.size ? (Math.max(...object.size) / 60 / 2) * (Math.PI / 180) * projection.scale : 0;
  context.strokeStyle = MARKER;
  context.lineWidth = MARKER_WIDTH * pixelRatio;
  context.beginPath();
  context.arc(
    point.x,
    point.y,
    Math.max(MIN_MARKER_RADIUS * pixelRatio, size + MARKER_MARGIN * pixelRatio),
    0,
    2 * Math.PI
  );
  context.stroke();
};

export const drawStarMap = (context: CanvasRenderingContext2D, scene: StarMapScene) => {
  const projection = createProjection(scene.view, scene.size, scene.orientation);
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, scene.size.width, scene.size.height);
  drawLines(context, projection, scene.pixelRatio);
  drawStars(context, projection, scene);
  drawBelowHorizon(context, projection, scene);
  drawMarker(context, projection, scene);
};
