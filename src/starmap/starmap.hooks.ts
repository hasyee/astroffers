import { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { NgcObject } from '../calculator/calculator.types';
import { useCurrentTime } from '../date/date.hooks';
import { useCoords } from '../location/location.hooks';
import { useQueryParam, useQueryParamSetter, useQueryParams, useQueryParamsSetter } from '../query/query.hooks';
import starLayer1Url from '../stars/stars.1.bin?url';
import starLayer2Url from '../stars/stars.2.bin?url';
import { type StarLayer, decodeStarLayer } from '../stars/stars.utils';
import { drawStarMap } from './starmap.draw';
import type { Orientation, Point, Size, View } from './starmap.projection';
import {
  FLIP_PARAMS,
  NORTH_CELESTIAL_POLE,
  ORIENTATION_PARAM,
  VIEW_PARAMS,
  getInitialView,
  getZenith,
  moveView,
  toView,
  toViewParamValues
} from './starmap.utils';

/** Zoom of a step of the wheel, by its delta (pixels) */
const WHEEL_ZOOM = 0.0015;
/**
 * The view gets into the query this long after a gesture (milliseconds): not frame by frame, which would be slow,
 * and Safari refuses `replaceState` called too often
 */
const VIEW_PARAMS_DELAY = 300;

export const useFlip = () => useQueryParams(FLIP_PARAMS);

export const useFlipSetter = () => useQueryParamsSetter(FLIP_PARAMS);

export const useOrientationType = () => useQueryParam(ORIENTATION_PARAM);

export const useOrientationTypeSetter = () => useQueryParamSetter(ORIENTATION_PARAM);

/** The imperative interface of the map, for its toolbar */
export type StarMapHandle = {
  /** The object back to the center, not zoomed */
  centerObject: () => void;
};

/** Loaded once in a session, at the first opening of the map (precached by the service worker, for offline use) */
let starLayersPromise: Promise<StarLayer[]> | null = null;

const loadStarLayers = () => {
  starLayersPromise ??= Promise.all(
    [starLayer1Url, starLayer2Url].map(async url => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${url}: ${response.status}`);
      return decodeStarLayer(await response.arrayBuffer());
    })
  ).catch(error => {
    // to be tried again at the next opening
    starLayersPromise = null;
    throw error;
  });
  return starLayersPromise;
};

/** The star layers, null while loading */
export const useStarLayers = () => {
  const [layers, setLayers] = useState<StarLayer[] | null>(null);
  useEffect(() => {
    let isCurrent = true;
    loadStarLayers().then(loaded => isCurrent && setLayers(loaded), console.error);
    return () => {
      isCurrent = false;
    };
  }, []);
  return layers;
};

/** The zenith of the place now, minute by minute */
const useZenith = () => {
  const time = useCurrentTime();
  const coords = useCoords();
  return useMemo(() => getZenith(time, coords), [time, coords]);
};

const getMiddle = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const getPointDistance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Draws the star map of the object on the canvas, opened around it (`getInitialView`): dragged by a finger or the
 * mouse, zoomed by a pinch or the wheel around their points; turned to the zenith (or the north celestial pole) up;
 * below the horizon of now in grey. The view of the query (of a link) is shown at the opening, its changes are
 * written back to it after the gestures (at once when centered). The
 * view is kept out of the state of React, so a gesture redraws the canvas only, at most once a frame.
 */
export const useStarMapCanvas = (canvasRef: RefObject<HTMLCanvasElement | null>, object: NgcObject): StarMapHandle => {
  const flip = useFlip();
  const orientationType = useOrientationType();
  const layers = useStarLayers();
  const zenith = useZenith();
  const viewParamValues = useQueryParams(VIEW_PARAMS);
  const setViewParamValues = useQueryParamsSetter(VIEW_PARAMS);
  const orientation = useMemo<Orientation>(
    () => ({ up: orientationType === 'equatorial' ? NORTH_CELESTIAL_POLE : zenith, flip }),
    [orientationType, zenith, flip]
  );
  const viewRef = useRef<View | null>(null);
  const sizeRef = useRef<Size>({ width: 0, height: 0 });
  const frameRef = useRef<number | null>(null);
  const viewParamsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // the latest of the props, read by the frame and the listeners
  const propsRef = useRef({ orientation, layers, object, zenith, viewParamValues, setViewParamValues });
  propsRef.current = { orientation, layers, object, zenith, viewParamValues, setViewParamValues };

  const redraw = useCallback(() => {
    if (frameRef.current !== null) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      const context = canvasRef.current?.getContext('2d');
      const view = viewRef.current;
      if (!context || !view || sizeRef.current.width === 0) return;
      drawStarMap(context, { ...propsRef.current, view, size: sizeRef.current, pixelRatio: window.devicePixelRatio });
    });
  }, [canvasRef]);

  useEffect(
    () => () => {
      cancelAnimationFrame(frameRef.current ?? 0);
      clearTimeout(viewParamsTimeoutRef.current);
    },
    []
  );

  // by its id: a recalculation of the list (e.g. at a new place) brings the same object anew, and keeps the view
  useLayoutEffect(() => {
    viewRef.current = toView(propsRef.current.viewParamValues) ?? getInitialView(propsRef.current.object);
    redraw();
  }, [object.id, redraw]);

  useEffect(redraw, [orientation, layers, zenith, redraw]);

  /** Shows the view, and writes it into the query after the delay */
  const setView = useCallback(
    (view: View, delay: number) => {
      viewRef.current = view;
      redraw();
      clearTimeout(viewParamsTimeoutRef.current);
      viewParamsTimeoutRef.current = setTimeout(
        () => propsRef.current.setViewParamValues(toViewParamValues(view)),
        delay
      );
    },
    [redraw]
  );

  const centerObject = useCallback(() => {
    const { object } = propsRef.current;
    if (viewRef.current) setView({ center: { ra: object.ra, de: object.de }, fov: viewRef.current.fov }, 0);
  }, [setView]);

  // the canvas in device pixels, as large as its element
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => {
      const pixelRatio = window.devicePixelRatio;
      canvas.width = Math.round(canvas.clientWidth * pixelRatio);
      canvas.height = Math.round(canvas.clientHeight * pixelRatio);
      sizeRef.current = { width: canvas.width, height: canvas.height };
      redraw();
    });
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [canvasRef, redraw]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // the points of the pointers down (fingers, the mouse), by their ids
    let pointers: Record<number, Point> = {};

    const toPoint = (event: MouseEvent): Point => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = canvas.width / rect.width;
      return { x: (event.clientX - rect.left) * pixelRatio, y: (event.clientY - rect.top) * pixelRatio };
    };

    const move = (from: Point, to: Point, zoom?: number) => {
      if (!viewRef.current) return;
      setView(
        moveView(viewRef.current, sizeRef.current, propsRef.current.orientation, from, to, zoom),
        VIEW_PARAMS_DELAY
      );
    };

    const handlePointerDown = (event: PointerEvent) => {
      canvas.setPointerCapture(event.pointerId);
      pointers = { ...pointers, [event.pointerId]: toPoint(event) };
    };

    // a finger drags, two of them pinch (and drag by their middle)
    const handlePointerMove = (event: PointerEvent) => {
      if (!(event.pointerId in pointers)) return;
      const next = { ...pointers, [event.pointerId]: toPoint(event) };
      const ids = Object.keys(pointers).map(Number);
      if (ids.length === 1) move(pointers[event.pointerId], next[event.pointerId]);
      if (ids.length === 2) {
        const [a, b] = ids.map(id => pointers[id]);
        const [nextA, nextB] = ids.map(id => next[id]);
        move(getMiddle(a, b), getMiddle(nextA, nextB), getPointDistance(a, b) / getPointDistance(nextA, nextB));
      }
      pointers = next;
    };

    const handlePointerUp = (event: PointerEvent) => {
      pointers = Object.fromEntries(Object.entries(pointers).filter(([id]) => Number(id) !== event.pointerId));
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const point = toPoint(event);
      move(point, point, Math.exp(event.deltaY * WHEEL_ZOOM));
    };

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    // not passive, not to scroll the page
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [canvasRef, setView]);

  return useMemo(() => ({ centerObject }), [centerObject]);
};
