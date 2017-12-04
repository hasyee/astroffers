import moment = require('moment');
import { Timestamp } from './types';

export const toNoon = (time: Timestamp): Timestamp => {
  return moment(time).startOf('day').hour(12).valueOf();
};

export const toMidnight = (time: Timestamp): Timestamp => {
  return moment(time).startOf('day').add(1, 'day').valueOf();
};

export const toNextDay = (time: Timestamp): Timestamp => {
  return moment(time).add(1, 'day').valueOf();
};

export const toPrevDay = (time: Timestamp): Timestamp => {
  return moment(time).subtract(1, 'day').valueOf();
};
