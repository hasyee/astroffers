import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CalendarWorker from '../calculator/calculator.calendar.worker?worker';
import type { CalendarDay, CalendarRequest, CalendarResponse, Timestamp } from '../calculator/calculator.types';
import { useFilter } from '../filter/filter.hooks';
import { useDate } from '../date/date.hooks';
import { useCoords } from '../location/location.hooks';
import { useQuerySelector, useQuerySetter } from '../router/router.hooks';
import { omitQuery } from '../router/router.utils';
import { MONTH_PARAMS, monthFromQuery, monthToQuery, toMonth } from './calendar.utils';

/** The week starts on Monday */
const WEEK_OFFSET = 1;

/** The month of the query, or the month of the night chosen in the filter */
export const useCalendarMonth = () => {
  const date = useDate();
  const month = useQuerySelector(query => monthFromQuery(query, NaN));
  return Number.isNaN(month) ? toMonth(date) : month;
};

export const useCalendarMonthSetter = () => {
  const date = useDate();
  const setQuery = useQuerySetter();
  return useCallback(
    (update: Timestamp | ((month: Timestamp) => Timestamp)) =>
      setQuery(query => {
        const month = monthFromQuery(query, toMonth(date));
        return { ...query, ...monthToQuery(typeof update === 'function' ? update(month) : update) };
      }),
    [date, setQuery]
  );
};

/** Removes the month from the query, when the calendar is left */
export const useCalendarMonthRemover = () => {
  const setQuery = useQuerySetter();
  return useCallback(() => setQuery(query => omitQuery(query, MONTH_PARAMS)), [setQuery]);
};

type Cache = { key: string; days: Record<Timestamp, CalendarDay[]> };

/**
 * Days of the given months with their nights, calculated in a worker at the location and the twilight of the filter.
 * Calculated months are kept (until the location or the twilight changes), so stepping to a neighbor month needs
 * the calculation of the new neighbor only. The months are requested in their order, the visible one first.
 */
export const useCalendarMonths = (months: Timestamp[]) => {
  const worker = useMemo(() => new CalendarWorker(), []);
  const coords = useCoords();
  const twilight = useFilter().twilight;
  const key = `${coords.lat} ${coords.lng} ${twilight}`;
  const keyRef = useRef(key);
  const requested = useRef(new Set<string>());
  const [cache, setCache] = useState<Cache>({ key, days: {} });

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    worker.onmessage = ({ data }: MessageEvent<CalendarResponse>) => {
      if (data.key !== keyRef.current) return;
      setCache(cache =>
        cache.key === data.key
          ? { key: data.key, days: { ...cache.days, [data.month]: data.days } }
          : { key: data.key, days: { [data.month]: data.days } }
      );
    };
  }, [worker]);

  useEffect(() => {
    for (const month of months) {
      const id = `${key}|${month}`;
      if (requested.current.has(id)) continue;
      requested.current.add(id);
      const request: CalendarRequest = { key, params: { month, weekOffset: WEEK_OFFSET, coords, twilight } };
      worker.postMessage(request);
    }
  }, [worker, months, key, coords, twilight]);

  useEffect(() => () => worker.terminate(), [worker]);

  // after a change of the location or the twilight the earlier months are shown until their recalculation arrives
  return cache.days;
};
