import { useCallback } from 'react';
import type { Timestamp } from '../calculator/calculator.types';
import { useQueryParam, useQueryParamSetter } from '../query/query.hooks';
import { DATE_PARAM, getToday } from './date.utils';

/** The night of this date: the `Date` of the query as a timestamp (of its local midnight), today without one */
export const useDate = (): Timestamp => useQueryParam(DATE_PARAM)?.getTime() ?? getToday();

export const useDateSetter = () => {
  const setDate = useQueryParamSetter(DATE_PARAM);
  return useCallback((date: Timestamp) => setDate(new Date(date)), [setDate]);
};
