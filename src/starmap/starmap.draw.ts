import type { NgcObject, Radians } from '../calculator/calculator.types';
import { getPreviewFieldOfView } from '../catalog/catalog.utils';
import { DAYLIGHT, MOONLESS_NIGHT, TWILIGHT } from '../chart/chart.colors';
import { CONSTELLATION_LINES } from '../constellation/constellation.utils';
import { type StarLayer, getTilesAround } from '../stars/stars.utils';
import theme from '../theme/theme';
import {
  type Orientation,
  type Point,
  type Projection,
  type Size,
  type View,
  createProjection,
  projectEq
} from './starmap.projection';
import {
  type Body,
  type Horizon,
  type Moon,
  type Pole,
  type SkyPhase,
  getDistance,
  getMagnitudeLimit,
  getStarRadius
} from './starmap.utils';
import { addScaled, cross, dot, normalize, toEq, toVector } from './starmap.vector';

/** The altitude of the Sun where the sky gets its daylight */
const DAYLIGHT_ALTITUDE = 10 * (Math.PI / 180);
/**
 * Its daylight is darker than the charts': their daylight mixed into their twilight this much, not to wash out the
 * white stars and marks
 */
const DAYLIGHT_RATIO = 0.5;
const STAR = theme.palette.common.white;
const LINE = 'rgba(255, 255, 255, 0.55)';
/** The ring of the object, its arrow, the directions on the horizon, the poles and the names of the bodies */
const MARK = theme.palette.primary.main;
/** Over the light blue sky of the daylight */
const DAYLIGHT_MARK = theme.palette.common.white;
const SUN = theme.palette.warning.main;
const MOON_LIT = theme.palette.grey[300];
/** The dark side of the Moon, faintly, to show its whole disc */
const MOON_DARK = 'rgba(255, 255, 255, 0.15)';
/** Darker than in the altitude chart (`chart.colors.ts`), over the stars */
const BELOW_HORIZON = 'rgba(128, 128, 128, 0.3)';

/** CSS pixels */
const LINE_WIDTH = 1.25;
const MARKER_WIDTH = 1.5;
const MIN_MARKER_RADIUS = 10;
const MARKER_MARGIN = 4;
/** The letters of the directions, larger than the other labels */
const DIRECTION_FONT_SIZE = 18;
const LABEL_FONT_SIZE = 13;
const HORIZON_TICK = 5;
/** From the point of the horizon to the middle of the letter of its direction */
const DIRECTION_LABEL_OFFSET = 18;
const POLE_CROSS = 5;

/** CSS pixels: the arrow towards the object off the canvas, its tip inside the edge by the margin */
const ARROW_MARGIN = 20;
const ARROW_LENGTH = 28;
const ARROW_WIDTH = 2;
const ARROW_HEAD_LENGTH = 10;
/** Half of the width of its head */
const ARROW_HEAD_WIDTH = 6;
/** Between the tail of the arrow and the box of its label */
const ARROW_LABEL_MARGIN = 4;

/** CSS pixels: the Sun and the Moon are at least this large (a few pixels in a wide field, in their true size) */
const MIN_BODY_RADIUS = 8;
const BODY_LABEL_MARGIN = 6;
/** Radians, a step from the Sun or the Moon, for the scale of the projection at it (and the side of the lit limb) */
const BODY_STEP = 0.01;

/** CSS pixels: the preview of the object fades in from the first size on the screen to the second one */
const PREVIEW_MIN_SIZE = 40;
const PREVIEW_FULL_SIZE = 80;
/** Of the radius of the preview, where its soft edge starts */
const PREVIEW_EDGE = 0.6;
/** Radians, a step to the north and to the east of the object, for the transformation of its preview */
const PREVIEW_STEP = 1e-4;

const DEG = Math.PI / 180;

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
  /** Of the place at the time of the map */
  horizon: Horizon;
  /** Of the orientation, the one up first */
  poles: Pole[];
  /** Of the object, masked (`createPreviewCanvas`); missing while loading, failed (e.g. offline) or none */
  preview: HTMLCanvasElement | null;
  /** Of the place at the time of the map; missing while loading */
  sun: Body | null;
  moon: Moon | null;
  /** The altitude of the Sun; missing while loading (a night sky) */
  sunAltitude: Radians | null;
  /** Of the filter, the altitude of the Sun where the night begins */
  twilight: Radians;
  /** By the altitude of the Sun; missing while loading */
  phase: SkyPhase | null;
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
  { view, size, horizon }: StarMapScene
) => {
  const up = toVector(horizon.zenith);
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

/** The preview image masked by a soft circle, to blend into the map without the edges of its square */
export const createPreviewCanvas = (image: HTMLImageElement) => {
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d');
  if (!context) return canvas;
  const radius = Math.min(canvas.width, canvas.height) / 2;
  const gradient = context.createRadialGradient(radius, radius, radius * PREVIEW_EDGE, radius, radius, radius);
  gradient.addColorStop(0, 'black');
  gradient.addColorStop(1, 'transparent');
  context.drawImage(image, 0, 0);
  context.globalCompositeOperation = 'destination-in';
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  return canvas;
};

/**
 * The preview of the object in its size and orientation (north up, east to the left in the image), faded in as it
 * gets large enough on the screen; its dark background blends into the sky (`screen`). The image is small, so its
 * projection is taken as linear: by the points of the canvas of the object and of steps to the north and the east.
 */
const drawPreview = (
  context: CanvasRenderingContext2D,
  projection: Projection,
  { pixelRatio, object, preview }: StarMapScene
) => {
  if (!preview) return;
  const at = projectEq(projection, object);
  const north = projectEq(projection, { ra: object.ra, de: object.de + PREVIEW_STEP });
  const east = projectEq(projection, { ra: object.ra + PREVIEW_STEP / Math.cos(object.de), de: object.de });
  if (!at || !north || !east) return;
  const fov = (getPreviewFieldOfView(object) / 60) * DEG;
  const size = ((Math.hypot(north.x - at.x, north.y - at.y) / PREVIEW_STEP) * fov) / pixelRatio;
  const opacity = Math.min(1, (size - PREVIEW_MIN_SIZE) / (PREVIEW_FULL_SIZE - PREVIEW_MIN_SIZE));
  if (opacity <= 0) return;
  // canvas pixels per pixel of the image, along its right (the west) and its down (the south)
  const scale = fov / PREVIEW_STEP / preview.width;
  context.save();
  context.globalAlpha = opacity;
  context.globalCompositeOperation = 'screen';
  context.setTransform(
    -(east.x - at.x) * scale,
    -(east.y - at.y) * scale,
    -(north.x - at.x) * scale,
    -(north.y - at.y) * scale,
    at.x,
    at.y
  );
  context.drawImage(preview, -preview.width / 2, -preview.height / 2);
  context.restore();
};

/**
 * The radius of the disc of a body on the canvas: in its true size (by the scale of the projection at it, from a step
 * to its north), at least `MIN_BODY_RADIUS`
 */
const getDiscRadius = (projection: Projection, pixelRatio: number, { eq, radius }: Body, at: Point) => {
  const north = projectEq(projection, { ra: eq.ra, de: eq.de + BODY_STEP });
  const localScale = north ? Math.hypot(north.x - at.x, north.y - at.y) / BODY_STEP : projection.scale;
  return Math.max(MIN_BODY_RADIUS * pixelRatio, radius * localScale);
};

const getMarkColor = ({ phase }: StarMapScene) => (phase === 'daylight' ? DAYLIGHT_MARK : MARK);

const drawBodyLabel = (
  context: CanvasRenderingContext2D,
  scene: StarMapScene,
  name: string,
  at: Point,
  radius: number
) => {
  const { pixelRatio } = scene;
  context.fillStyle = getMarkColor(scene);
  context.font = `${LABEL_FONT_SIZE * pixelRatio}px "Inter Variable", sans-serif`;
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(name, at.x + radius + BODY_LABEL_MARGIN * pixelRatio, at.y);
};

/** The Sun as a disc of its true size (at least `MIN_BODY_RADIUS`) */
const drawSun = (context: CanvasRenderingContext2D, projection: Projection, scene: StarMapScene) => {
  const { pixelRatio, sun } = scene;
  if (!sun) return;
  const at = projectEq(projection, sun.eq);
  if (!at) return;
  const radius = getDiscRadius(projection, pixelRatio, sun, at);
  context.fillStyle = SUN;
  context.beginPath();
  context.arc(at.x, at.y, radius, 0, 2 * Math.PI);
  context.fill();
  drawBodyLabel(context, scene, 'Sun', at, radius);
};

/**
 * The Moon in its phase and its true size (at least `MIN_BODY_RADIUS`), its bright limb towards the Sun however the
 * map is turned: the lit half of the disc on the side of the Sun, closed by the terminator, a half-ellipse as wide as
 * the illuminated fraction tells (bulging towards the Sun for a crescent, away from it beyond the half Moon)
 */
const drawMoon = (context: CanvasRenderingContext2D, projection: Projection, scene: StarMapScene) => {
  const { pixelRatio, sun, moon } = scene;
  if (!moon || !sun) return;
  const moonVector = toVector(moon.eq);
  const sunVector = toVector(sun.eq);
  const towardsSun = normalize(addScaled(sunVector, moonVector, -dot(sunVector, moonVector)));
  const at = projectEq(projection, moon.eq);
  const sunward = projectEq(projection, toEq(normalize(addScaled(moonVector, towardsSun, BODY_STEP))));
  if (!at || !sunward) return;
  const angle = Math.atan2(sunward.y - at.y, sunward.x - at.x);
  const radius = getDiscRadius(projection, pixelRatio, moon, at);
  const isCrescent = moon.illuminated < 0.5;

  context.fillStyle = MOON_DARK;
  context.beginPath();
  context.arc(at.x, at.y, radius, 0, 2 * Math.PI);
  context.fill();

  context.fillStyle = MOON_LIT;
  context.beginPath();
  context.arc(at.x, at.y, radius, angle - Math.PI / 2, angle + Math.PI / 2);
  context.ellipse(
    at.x,
    at.y,
    radius * Math.abs(2 * moon.illuminated - 1),
    radius,
    angle,
    Math.PI / 2,
    isCrescent ? -Math.PI / 2 : (3 * Math.PI) / 2,
    isCrescent
  );
  context.fill();
  drawBodyLabel(context, scene, 'Moon', at, radius);
};

/**
 * The directions on the horizon by ticks, their letters below them (towards the point 1° below, wherever the map is
 * turned), and the poles of the orientation by small crosses with their names
 */
const drawLabels = (context: CanvasRenderingContext2D, projection: Projection, scene: StarMapScene) => {
  const { pixelRatio, horizon, poles } = scene;
  context.strokeStyle = getMarkColor(scene);
  context.fillStyle = getMarkColor(scene);
  context.lineWidth = LINE_WIDTH * pixelRatio;
  context.font = `${DIRECTION_FONT_SIZE * pixelRatio}px "Inter Variable", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.beginPath();
  horizon.directions.forEach(({ name, point, below }) => {
    const at = projectEq(projection, point);
    const towards = projectEq(projection, below);
    if (!at || !towards) return;
    const length = Math.hypot(towards.x - at.x, towards.y - at.y);
    const [x, y] = [(towards.x - at.x) / length, (towards.y - at.y) / length];
    context.moveTo(at.x, at.y);
    context.lineTo(at.x + x * HORIZON_TICK * pixelRatio, at.y + y * HORIZON_TICK * pixelRatio);
    context.fillText(
      name,
      at.x + x * DIRECTION_LABEL_OFFSET * pixelRatio,
      at.y + y * DIRECTION_LABEL_OFFSET * pixelRatio
    );
  });
  context.textAlign = 'left';
  context.font = `${LABEL_FONT_SIZE * pixelRatio}px "Inter Variable", sans-serif`;
  poles.forEach(({ name, point }) => {
    const at = projectEq(projection, point);
    if (!at) return;
    const arm = POLE_CROSS * pixelRatio;
    context.moveTo(at.x - arm, at.y);
    context.lineTo(at.x + arm, at.y);
    context.moveTo(at.x, at.y - arm);
    context.lineTo(at.x, at.y + arm);
    context.fillText(name, at.x + arm * 2, at.y + arm * 2);
  });
  context.stroke();
};

/** Of the ring around the object, at least as large as the object (device pixels) */
const getMarkerRadius = (projection: Projection, { pixelRatio, object }: StarMapScene) => {
  const size = object.size ? (Math.max(...object.size) / 60 / 2) * DEG * projection.scale : 0;
  return Math.max(MIN_MARKER_RADIUS * pixelRatio, size + MARKER_MARGIN * pixelRatio);
};

const drawMarker = (context: CanvasRenderingContext2D, projection: Projection, scene: StarMapScene) => {
  const point = projectEq(projection, scene.object);
  if (!point) return;
  context.strokeStyle = getMarkColor(scene);
  context.lineWidth = MARKER_WIDTH * scene.pixelRatio;
  context.beginPath();
  context.arc(point.x, point.y, getMarkerRadius(projection, scene), 0, 2 * Math.PI);
  context.stroke();
};

/** Degrees, one decimal below 10° */
const formatDistance = (distance: number) => {
  const degrees = distance / DEG;
  return `${degrees < 10 ? degrees.toFixed(1) : Math.round(degrees)}°`;
};

/**
 * An arrow at the edge of the canvas towards the object when its ring is off the canvas, on the radius from the center
 * to the object, with its distance from the center inside. The projection is azimuthal, so the direction of the radius
 * is the direction of the great circle to the object: dragging the map along it is the shortest way there. The object
 * is projected without leaving out the far side, to have a direction behind the observer too (all but the antipode).
 */
const drawObjectArrow = (context: CanvasRenderingContext2D, projection: Projection, scene: StarMapScene) => {
  const { view, size, pixelRatio, object } = scene;
  const point = projection.project(object.ra, Math.sin(object.de), Math.cos(object.de), -1);
  if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) return;
  const ringRadius = getMarkerRadius(projection, scene);
  const isRingOnCanvas =
    point.x > -ringRadius &&
    point.y > -ringRadius &&
    point.x < size.width + ringRadius &&
    point.y < size.height + ringRadius;
  if (isRingOnCanvas) return;

  const [centerX, centerY] = [size.width / 2, size.height / 2];
  const length = Math.hypot(point.x - centerX, point.y - centerY);
  const [x, y] = [(point.x - centerX) / length, (point.y - centerY) / length];
  // where the radius crosses the edge of the canvas, inset by the margin
  const margin = ARROW_MARGIN * pixelRatio;
  const reach = Math.min(
    x === 0 ? Infinity : (centerX - margin) / Math.abs(x),
    y === 0 ? Infinity : (centerY - margin) / Math.abs(y)
  );
  const tip = { x: centerX + x * reach, y: centerY + y * reach };
  const headBase = { x: tip.x - x * ARROW_HEAD_LENGTH * pixelRatio, y: tip.y - y * ARROW_HEAD_LENGTH * pixelRatio };
  const tail = { x: tip.x - x * ARROW_LENGTH * pixelRatio, y: tip.y - y * ARROW_LENGTH * pixelRatio };
  const headWidth = ARROW_HEAD_WIDTH * pixelRatio;

  context.strokeStyle = getMarkColor(scene);
  context.fillStyle = getMarkColor(scene);
  context.lineWidth = ARROW_WIDTH * pixelRatio;
  context.beginPath();
  context.moveTo(tail.x, tail.y);
  context.lineTo(headBase.x, headBase.y);
  context.stroke();
  context.beginPath();
  context.moveTo(tip.x, tip.y);
  context.lineTo(headBase.x - y * headWidth, headBase.y + x * headWidth);
  context.lineTo(headBase.x + y * headWidth, headBase.y - x * headWidth);
  context.closePath();
  context.fill();

  // the label inside the tail, its box just clear of it in any direction
  const label = formatDistance(getDistance(view.center, object));
  context.font = `${LABEL_FONT_SIZE * pixelRatio}px "Inter Variable", sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  const halfExtent = (Math.abs(x) * context.measureText(label).width + Math.abs(y) * LABEL_FONT_SIZE * pixelRatio) / 2;
  const offset = halfExtent + ARROW_LABEL_MARGIN * pixelRatio;
  context.fillText(label, tail.x - x * offset, tail.y - y * offset);
};

/**
 * The sky by the altitude of the Sun, in the colors of the charts (`chart.colors.ts`), continuous: from the night to the
 * twilight between the twilight of the filter and the sunrise, then on to the daylight (darker, `DAYLIGHT_RATIO`)
 */
const drawSky = (context: CanvasRenderingContext2D, { size, sunAltitude, twilight }: StarMapScene) => {
  const altitude = sunAltitude ?? twilight;
  const [from, to, ratio] =
    altitude < 0
      ? [MOONLESS_NIGHT, TWILIGHT, (altitude - twilight) / -twilight]
      : [TWILIGHT, DAYLIGHT, Math.min(1, altitude / DAYLIGHT_ALTITUDE) * DAYLIGHT_RATIO];
  context.fillStyle = from;
  context.fillRect(0, 0, size.width, size.height);
  context.globalAlpha = Math.min(1, Math.max(0, ratio));
  context.fillStyle = to;
  context.fillRect(0, 0, size.width, size.height);
  context.globalAlpha = 1;
};

export const drawStarMap = (context: CanvasRenderingContext2D, scene: StarMapScene) => {
  const projection = createProjection(scene.view, scene.size, scene.orientation);
  drawSky(context, scene);
  drawLines(context, projection, scene.pixelRatio);
  drawStars(context, projection, scene);
  drawPreview(context, projection, scene);
  drawSun(context, projection, scene);
  drawMoon(context, projection, scene);
  drawBelowHorizon(context, projection, scene);
  drawLabels(context, projection, scene);
  drawMarker(context, projection, scene);
  drawObjectArrow(context, projection, scene);
};
