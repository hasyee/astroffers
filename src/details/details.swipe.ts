import { useEffect, useRef } from 'react';

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
 * Steps to the previous / next item by swiping the returned element horizontally with a finger:
 * the content follows the finger, slides out, and the new item slides in from the other side.
 * Vertical scrolling stays native (`touch-action: pan-y` on the element).
 */
export const useSwipe = <T extends HTMLElement>({ onPrev, onNext }: Handlers) => {
  const ref = useRef<T>(null);
  const handlers = useRef<Handlers>({ onPrev, onNext });
  useEffect(() => {
    handlers.current = { onPrev, onNext };
  }, [onPrev, onNext]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let start: { x: number; y: number; time: number; pointerId: number } | null = null;
    let isHorizontal = false;
    let isAnimating = false;

    const setOffset = (x: number, animated = false) => {
      element.style.transition = animated ? `transform ${DURATION}ms ease-out` : '';
      element.style.transform = x ? `translateX(${x}px)` : '';
    };

    // swiping to the left steps forward
    const getStep = (dx: number) => (dx < 0 ? handlers.current.onNext : handlers.current.onPrev);

    const handlePointerDown = (event: PointerEvent) => {
      if (event.pointerType !== 'touch' || isAnimating || start) return;
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
      const width = element.offsetWidth;
      if (!step || (Math.abs(dx) < width * DISTANCE_THRESHOLD && velocity < VELOCITY_THRESHOLD)) {
        setOffset(0, true);
        return;
      }

      isAnimating = true;
      const direction = Math.sign(dx);
      setOffset(direction * width, true);
      setTimeout(() => {
        step();
        // the next item enters from the opposite side
        setOffset(-direction * width);
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            setOffset(0, true);
            setTimeout(() => {
              element.style.transition = '';
              isAnimating = false;
            }, DURATION);
          })
        );
      }, DURATION);
    };

    const handlePointerCancel = (event: PointerEvent) => {
      if (!start || event.pointerId !== start.pointerId) return;
      start = null;
      setOffset(0, true);
    };

    element.addEventListener('pointerdown', handlePointerDown);
    element.addEventListener('pointermove', handlePointerMove);
    element.addEventListener('pointerup', handlePointerUp);
    element.addEventListener('pointercancel', handlePointerCancel);
    return () => {
      element.removeEventListener('pointerdown', handlePointerDown);
      element.removeEventListener('pointermove', handlePointerMove);
      element.removeEventListener('pointerup', handlePointerUp);
      element.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, []);

  return ref;
};
