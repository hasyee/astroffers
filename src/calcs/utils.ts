import { Timestamp } from './types';
import leftpad = require('left-pad');

export const flatten = <T>(array: T[][]) => array.reduce((prev, next) => [ ...prev, ...next ], []);

export const stringifyTimeDiff = (diff: Timestamp): string => {
  const hours = Math.floor(diff / 3600 / 1000);
  const mins = Math.round((diff % (3600 * 1000)) / 60 / 1000);
  return `${leftpad(hours, 2, 0)}:${leftpad(mins, 2, 0)}`;
};
