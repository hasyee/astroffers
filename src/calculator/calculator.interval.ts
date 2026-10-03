import type { Interval, Timestamp } from './calculator.types';

export const getIntersection = (interval1: Interval | null, interval2: Interval | null): Interval | null => {
  if (!interval1 || !interval2) return null;
  const { start: start1, end: end1 } = interval1;
  const { start: start2, end: end2 } = interval2;
  if (start1 > end2 || start2 > end1) return null;
  return {
    start: Math.max(start1, start2),
    end: Math.min(end1, end2)
  };
};

export const isInInterval = (interval: Interval | null, value: Timestamp): boolean => {
  if (!interval || !Number.isFinite(value)) return false;
  const { start, end } = interval;
  return value >= start && value <= end;
};

export const logInterval = ({ start, end }: Interval, label = '') => {
  console.log(label, new Date(start).toLocaleString(), '-', new Date(end).toLocaleString());
};
