import { useCallback, useEffect, useState } from 'react';
import type { Timestamp } from '../calculator/calculator.types';
import { useQueryParam, useQueryParamSetter } from '../query/query.hooks';
import { DATE_PARAM, getToday } from './date.utils';

/** The night of this date: the `Date` of the query as a timestamp (of its local midnight), today without one */
export const useDate = (): Timestamp => useQueryParam(DATE_PARAM)?.getTime() ?? getToday();

const MINUTE = 60 * 1000;

/** The current time, refreshed at the start of every minute and when the app gets visible again */
export const useCurrentTime = (): Timestamp => {
  const [time, setTime] = useState(Date.now);
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const tick = () => {
      setTime(Date.now());
      timeout = setTimeout(tick, MINUTE - (Date.now() % MINUTE));
    };
    // the timers of a hidden page are throttled
    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') return;
      clearTimeout(timeout);
      tick();
    };
    timeout = setTimeout(tick, MINUTE - (Date.now() % MINUTE));
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearTimeout(timeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  return time;
};

export const useDateSetter = () => {
  const setDate = useQueryParamSetter(DATE_PARAM);
  return useCallback((date: Timestamp) => setDate(new Date(date)), [setDate]);
};
