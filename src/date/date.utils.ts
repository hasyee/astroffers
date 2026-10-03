import moment from 'moment';
import type { Timestamp } from '../calculator/calculator.types';

export const getToday = (): Timestamp => moment().startOf('day').valueOf();
