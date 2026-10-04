import moment from 'moment';
import type { Timestamp } from '../calculator/calculator.types';
import { MAX_DATE, MIN_DATE } from '../date/date.utils';
import type { Query } from '../router/router.types';

const MONTH_FORMAT = 'YYYY-MM';

/** Query param of the month of the calendar: `month=YYYY-MM`, only on `/calendar` */
export const MONTH_PARAMS = ['month'] as const;

export const toMonth = (date: Timestamp) => moment(date).startOf('month').valueOf();

export const monthFromQuery = (query: Query, fallback: Timestamp): Timestamp => {
  const month = moment(query.month, MONTH_FORMAT, true);
  return month.isValid() && month.isBetween(MIN_DATE, MAX_DATE, 'month', '[]') ? month.valueOf() : fallback;
};

export const monthToQuery = (month: Timestamp): Query => ({ month: moment(month).format(MONTH_FORMAT) });
