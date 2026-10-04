import type { Timestamp } from '../calculator/calculator.types';
import { useStatePart, useStatePartSetter } from '../query/query.hooks';
import type { StoredState } from '../query/query.types';
import type { Query } from '../router/router.types';
import { dateFromQuery, dateToQuery, getToday } from './date.utils';

const getDate = (query: Query) => dateFromQuery(query, getToday());
const getStoredDate = (state: StoredState) => state.date;
const setQueryDate = (query: Query, date: Timestamp): Query => ({ ...query, ...dateToQuery(date) });
const setStoredDate = (state: StoredState, date: Timestamp): StoredState => ({ ...state, date });

/** The night of this date */
export const useDate = () => useStatePart(getDate, getStoredDate, String, Number);

export const useDateSetter = () => useStatePartSetter(getDate, setQueryDate, getStoredDate, setStoredDate);
