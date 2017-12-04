import { Interval, Timestamp } from './types';

export const getIntersection = (interval1: Interval, interval2: Interval): Interval => {
  if (!interval1 || !interval2) return null;
  const { start: start1, end: end1 } = interval1;
  const { start: start2, end: end2 } = interval2;
  if (start1 > end2 || start2 > end1) return null;
  return {
    start: Math.max(start1, start2),
    end: Math.min(end1, end2)
  };
};

export const isInInterval = (interval: Interval, value: Timestamp): boolean => {
  if (!interval || !Number.isFinite(value)) return false;
  const { start, end } = interval;
  return value >= start && value <= end;
};
