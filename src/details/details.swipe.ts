import { useEffect, useLayoutEffect, useRef } from 'react';

/** Part of the width to drag over to step */
const DISTANCE_THRESHOLD = 0.25;
/** Speed of a flick to step anyway, in px/ms */
const VELOCITY_THRESHOLD = 0.5;
/** Movement deciding between a horizontal swipe and a vertical scroll, in px */
const DIRECTION_LOCK = 10;
/** Damping of the drag when there is nothing to step to */
const RESISTANCE = 0.3;
const DURATION = 200;

type Handlers = { onPrev: (() => void) | null; onNext: (() => void) | null };

/**
 * Carousel swiping on a track of three pages (previous, current, next) side by side, the current one in the
 * middle of the viewport: the track follows the finger, slides to the neighbor on release, then the step
 * happens, and the track jumps back to the middle without a transition when `currentKey` changes, since by
 * then the neighbor became the current page. Vertical scrolling stays native (`touch-action: pan-y`).
 */
export const useSwipe = <T extends HTMLElement>({ onPrev, onNext }: Handlers, currentKey: unknown) => {
  const ref = useRef<T>(null);
  const handlers = useRef<Handlers>({ onPrev, onNext });
  const isAnimating = useRef(false);

  useEffect(() => {
    handlers.current = { onPrev, onNext };
  }, [onPrev, onNext]);

  // before painting the new current page, put it back to the middle
  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.style.transition = '';
    ref.current.style.transform = '';
    isAnimating.current = false;
  }, [currentKey]);

  useEffect(() => {
    const track = ref.current;
    if (!track) return;

    let start: { x: number; y: number; time: number; pointerId: number } | null = null;
    let isHorizontal = false;

    const setOffset = (x: number, animated = false) => {
      track.style.transition = animated ? `transform ${DURATION}ms ease-out` : '';
      track.style.transform = x ? `translateX(${x}px)` : '';
    };

    // swiping to the left steps forward
    const getStep = (dx: number) => (dx < 0 ? handlers.current.onNext : handlers.current.onPrev);

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || isAnimating.current || start) return;
      start = { x: event.clientX, y: event.clientY, time: event.timeStamp, pointerId: event.pointerId };
      isHorizontal = false;
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!isHorizontal) {
        if (Math.abs(dy) > DIRECTION_LOCK && Math.abs(dy) > Math.abs(dx)) {
          start = null; // a vertical scroll
          return;
        }
        if (Math.abs(dx) < DIRECTION_LOCK) return;
        isHorizontal = true;
      }
      setOffset(getStep(dx) ? dx : dx * RESISTANCE);
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.pointerId) return;
      const dx = event.clientX - start.x;
      const velocity = Math.abs(dx) / Math.max(1, event.timeStamp - start.time);
      const wasHorizontal = isHorizontal;
      start = null;
      if (!wasHorizontal) return;

      const step = getStep(dx);
      const pageWidth = track.parentElement?.offsetWidth ?? 0;
      if (!step || (Math.abs(dx) < pageWidth * DISTANCE_THRESHOLD && velocity < VELOCITY_THRESHOLD)) {
        setOffset(0, true);
        return;
      }

      isAnimating.current = true;
      setOffset(Math.sign(dx) * pageWidth, true);
      setTimeout(step, DURATION);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.pointerId) return;
      start = null;
      setOffset(0, true);
    };

    track.addEventListener('pointerdown', handlePointerDown);
    track.addEventListener('pointermove', handlePointerMove);
    track.addEventListener('pointerup', handlePointerUp);
    track.addEventListener('pointercancel', handlePointerCancel);
    return () => {
      track.removeEventListener('pointerdown', handlePointerDown);
      track.removeEventListener('pointermove', handlePointerMove);
      track.removeEventListener('pointerup', handlePointerUp);
      track.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, []);

  return ref;
};
