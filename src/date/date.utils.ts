import moment from 'moment';
import type { Timestamp } from '../calculator/calculator.types';
import { createDateParam } from '../query/query.params';

export const getToday = (): Timestamp => moment().startOf('day').valueOf();

/** Query param of the date: `date=YYYY-MM-DD` (always in the query, completed by `restoreQuery`) */
export const DATE_PARAM = createDateParam('date');
