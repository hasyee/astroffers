import { type RefObject, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type * as Astronomy from 'astronomy-engine';
import type { NgcInfo, NgcObject, Timestamp } from '../calculator/calculator.types';
import { getObjectImgSrc } from '../catalog/catalog.utils';
import { useCoords } from '../location/location.hooks';
import { useQueryParam, useQueryParamSetter, useQueryParams, useQueryParamsSetter } from '../query/query.hooks';
import starLayer1Url from '../stars/stars.1.bin?url';
import starLayer2Url from '../stars/stars.2.bin?url';
import { type StarLayer, decodeStarLayer } from '../stars/stars.utils';
import { createPreviewCanvas, drawStarMap } from './starmap.draw';
import type { Orientation, Point, Size, View } from './starmap.projection';
import {
  FLIP_PARAMS,
  ORIENTATION_PARAM,
  VIEW_PARAMS,
  getCelestialPoles,
  getHorizonPoles,
  getInitialView,
  getHorizon,
  getMoon,
  getSun,
  getOpeningTime,
  TIME_PARAM,
  toTimeParamValue,
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

/**
 * Loaded once in a session, at the first opening of the map, in a chunk of its own (precached, for offline use): the
 * calculator's worker has its own copy
 */
let astronomyPromise: Promise<typeof Astronomy> | null = null;

const loadAstronomy = () => {
  astronomyPromise ??= import('astronomy-engine').catch(error => {
    // to be tried again at the next opening
    astronomyPromise = null;
    throw error;
  });
  return astronomyPromise;
};

/** `astronomy-engine`, null while loading */
const useAstronomy = () => {
  const [astronomy, setAstronomy] = useState<typeof Astronomy | null>(null);
  useEffect(() => {
    let isCurrent = true;
    loadAstronomy().then(loaded => isCurrent && setAstronomy(loaded), console.error);
    return () => {
      isCurrent = false;
    };
  }, []);
  return astronomy;
};

/**
 * The time of the sky of the map (`TIME_PARAM`): the one of the query (of a link, or chosen), else the one chosen at
 * the opening (`getOpeningTime`), written into the query before the paint. It does not go on: finding an object takes
 * a few minutes.
 */
export const useMapTime = (ngcInfo: NgcInfo): Timestamp => {
  const value = useQueryParam(TIME_PARAM);
  const setValue = useQueryParamSetter(TIME_PARAM);
  const [openingTime] = useState(() => getOpeningTime(ngcInfo, Date.now()));
  const isMissing = value === null;
  useLayoutEffect(() => {
    if (isMissing) setValue(toTimeParamValue(openingTime));
  }, [isMissing, openingTime, setValue]);
  return value === null ? openingTime : value * 1000;
};

export const useMapTimeSetter = () => {
  const setValue = useQueryParamSetter(TIME_PARAM);
  return useCallback((time: Timestamp) => setValue(toTimeParamValue(time)), [setValue]);
};

/** The horizon, the Sun and the Moon (null while loading) of the place at the time */
const useSky = (time: Timestamp) => {
  const coords = useCoords();
  const astronomy = useAstronomy();
  const horizon = useMemo(() => getHorizon(time, coords), [time, coords]);
  const sun = useMemo(() => (astronomy ? getSun(astronomy, time, coords) : null), [astronomy, time, coords]);
  const moon = useMemo(() => (astronomy ? getMoon(astronomy, time, coords) : null), [astronomy, time, coords]);
  return { horizon, sun, moon };
};

/**
 * The DSS2 preview of the object, masked, null while loading or when it fails (e.g. offline, not cached yet); none of
 * the bodies of the Solar System, whose photos are not to scale
 */
const usePreview = (object: NgcObject) => {
  const [preview, setPreview] = useState<{ id: string; canvas: HTMLCanvasElement } | null>(null);
  useEffect(() => {
    if (object.photo) return;
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => setPreview({ id: object.id, canvas: createPreviewCanvas(image) });
    image.src = getObjectImgSrc(object);
    return () => {
      image.onload = null;
    };
  }, [object]);
  return preview?.id === object.id ? preview.canvas : null;
};

const getMiddle = (a: Point, b: Point): Point => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

const getPointDistance = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Draws the star map of the object on the canvas, opened around it (`getInitialView`): dragged by a finger or the
 * mouse, zoomed by a pinch or the wheel around their points; turned to the zenith (or the north celestial pole) up;
 * below the horizon of the time of the map in grey, its Sun, its Moon in its phase. The view of the query (of a link) is shown
 * at the opening, its changes are written back to it after the gestures (at once when centered). The view is kept out
 * of the state of React, so a gesture redraws the canvas only, at most once a frame.
 */
export const useStarMapCanvas = (
  canvasRef: RefObject<HTMLCanvasElement | null>,
  object: NgcObject,
  time: Timestamp
): StarMapHandle => {
  const flip = useFlip();
  const orientationType = useOrientationType();
  const layers = useStarLayers();
  const { horizon, sun, moon } = useSky(time);
  const preview = usePreview(object);
  const viewParamValues = useQueryParams(VIEW_PARAMS);
  const setViewParamValues = useQueryParamsSetter(VIEW_PARAMS);
  const poles = useMemo(
    () => (orientationType === 'equatorial' ? getCelestialPoles(time) : getHorizonPoles(horizon)),
    [orientationType, time, horizon]
  );
  const orientation = useMemo<Orientation>(() => ({ up: poles[0].point, flip }), [poles, flip]);
  const viewRef = useRef<View | null>(null);
  const sizeRef = useRef<Size>({ width: 0, height: 0 });
  const frameRef = useRef<number | null>(null);
  const viewParamsTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // the latest of the props, read by the frame and the listeners
  const propsRef = useRef({
    orientation,
    layers,
    object,
    horizon,
    poles,
    sun,
    moon,
    preview,
    viewParamValues,
    setViewParamValues
  });
  propsRef.current = {
    orientation,
    layers,
    object,
    horizon,
    poles,
    sun,
    moon,
    preview,
    viewParamValues,
    setViewParamValues
  };

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

  useEffect(redraw, [orientation, layers, horizon, sun, moon, preview, redraw]);

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
