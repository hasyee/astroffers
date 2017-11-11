import { Interval, Timestamp } from './types';

const prepareInterval = ({ start, end }: Interval): Interval => ({
  start: Number.isFinite(start) ? start : Infinity,
  end: Number.isFinite(end) ? end : Infinity
});

const unprepareInterval = ({ start, end }: Interval): Interval => ({
  start: Number.isFinite(start) ? start : undefined,
  end: Number.isFinite(end) ? end : undefined
});

export const getIntersection = (interval1: Interval, interval2: Interval): Interval => {
  const { start: start1, end: end1 } = prepareInterval(interval1);
  const { start: start2, end: end2 } = prepareInterval(interval2);
  if (start1 > end2 || start2 > end1) return null;
  return unprepareInterval({
    start: Math.max(start1, start2),
    end: Math.min(end1, end2)
  });
};

export const isInInterval = (interval: Interval, value: Timestamp): boolean => {
  if (!Number.isFinite(value)) return false;
  const { start, end } = prepareInterval(interval);
  return value >= start && value <= end;
};
