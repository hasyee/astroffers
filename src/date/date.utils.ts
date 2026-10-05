import moment from 'moment';
import type { Timestamp } from '../calculator/calculator.types';
import type { Query } from '../router/router.types';

export const getToday = (): Timestamp => moment().startOf('day').valueOf();

export const DATE_FORMAT = 'YYYY-MM-DD';

/** Dates of the query outside of this range are ignored */
export const MIN_DATE = '1900-01-01';
export const MAX_DATE = '2100-12-31';

/** Parses a date in the `YYYY-MM-DD` format within the supported range */
export const parseDate = (value: string | undefined): Timestamp | null => {
  const date = moment(value, DATE_FORMAT, true);
  return date.isValid() && date.isBetween(MIN_DATE, MAX_DATE, 'day', '[]') ? date.valueOf() : null;
};

/** Query param of the date: `date=YYYY-MM-DD` */
export const DATE_PARAMS = ['date'] as const;

export const dateFromQuery = (query: Query, fallback: Timestamp): Timestamp => parseDate(query.date) ?? fallback;

export const dateToQuery = (date: Timestamp): Query => ({ date: moment(date).format(DATE_FORMAT) });
