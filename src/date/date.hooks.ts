import type { Timestamp } from '../calculator/calculator.types';
import { useQueryState, useQueryStateSetter } from '../query/query.hooks';
import type { Query } from '../router/router.types';
import { dateFromQuery, dateToQuery, getToday } from './date.utils';

const getDate = (query: Query) => dateFromQuery(query, getToday());
const setQueryDate = (query: Query, date: Timestamp): Query => ({ ...query, ...dateToQuery(date) });

/** The night of this date */
export const useDate = () => useQueryState(getDate, String, Number);

export const useDateSetter = () => useQueryStateSetter(getDate, setQueryDate);
