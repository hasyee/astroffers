import { useCallback, useEffect, useSyncExternalStore } from 'react';
import moment from 'moment';
import CalendarWorker from '../calculator/calculator.calendar.worker?worker';
import type { CalendarDay, CalendarRequest, CalendarResponse, Timestamp } from '../calculator/calculator.types';
import { useDate } from '../date/date.hooks';
import { useFilter } from '../filter/filter.hooks';
import { useCoords } from '../location/location.hooks';
import type { Coords } from '../location/location.types';
import { useQueryState, useQueryStateSetter } from '../query/query.hooks';
import type { Query } from '../router/router.types';
import { omitQuery } from '../router/router.utils';
import { CALENDAR_PARAMS, calendarFromQuery, calendarToQuery } from './calendar.utils';

/** The week starts on Monday */
const WEEK_OFFSET = 1;

/** The month of the chosen night is calculated in the background this long after its last change */
const PREFETCH_DELAY = 1000;

export const toMonth = (date: Timestamp) => moment(date).startOf('month').valueOf();

const getIsOpen = (query: Query) => calendarFromQuery(query, false);
const parseIsOpen = (serialized: string) => serialized === 'true';
// the param is left out while the calendar is closed, so it is replaced
const setQueryIsOpen = (query: Query, isOpen: boolean): Query => ({
  ...omitQuery(query, CALENDAR_PARAMS),
  ...calendarToQuery(isOpen)
});

/** The calendar is open (above the summary), toggled by the date in the header */
export const useCalendarOpen = () => {
  const isOpen = useQueryState(getIsOpen, String, parseIsOpen);
  const setIsOpen = useQueryStateSetter(getIsOpen, setQueryIsOpen);
  const toggle = useCallback(() => setIsOpen(isOpen => !isOpen), [setIsOpen]);
  return [isOpen, toggle] as const;
};

type Cache = { key: string; days: Record<Timestamp, CalendarDay[]> };

/**
 * The calculated months of the location and the twilight of the latest request, kept for the whole session (the
 * calendar is mounted only while open), in one worker created by the first request.
 */
let cache: Cache = { key: '', days: {} };
let latestKey = '';
const requested = new Set<Timestamp>();
const listeners = new Set<() => void>();
let worker: Worker | null = null;

const getKey = (coords: Coords, twilight: number) => `${coords.lat} ${coords.lng} ${twilight}`;

const handleResponse = ({ data }: MessageEvent<CalendarResponse>) => {
  if (data.key !== latestKey) return;
  // after a change of the location or the twilight the earlier months are shown until their recalculation arrives
  cache =
    cache.key === data.key
      ? { key: data.key, days: { ...cache.days, [data.month]: data.days } }
      : { key: data.key, days: { [data.month]: data.days } };
  listeners.forEach(listener => listener());
};

const requestMonth = (month: Timestamp, coords: Coords, twilight: number) => {
  const key = getKey(coords, twilight);
  if (key !== latestKey) {
    latestKey = key;
    requested.clear();
  }
  if (requested.has(month)) return;
  requested.add(month);
  if (!worker) {
    worker = new CalendarWorker();
    worker.onmessage = handleResponse;
  }
  const request: CalendarRequest = { key, params: { month, weekOffset: WEEK_OFFSET, coords, twilight } };
  worker.postMessage(request);
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const getDays = () => cache.days;

/**
 * Days of the given months with their nights, calculated in a worker at the location and the twilight of the filter.
 * Calculated months are kept (until the location or the twilight changes), so stepping to a neighbor month needs
 * the calculation of the new neighbor only. The months are requested in their order, the visible one first.
 */
export const useCalendarMonths = (months: Timestamp[]) => {
  const coords = useCoords();
  const { twilight } = useFilter();

  useEffect(() => {
    for (const month of months) requestMonth(month, coords, twilight);
  }, [months, coords, twilight]);

  return useSyncExternalStore(subscribe, getDays);
};

/**
 * Calculates the month of the chosen night in the background, so the calendar opens with it at once (a month takes
 * a moment on a phone). Delayed, not to calculate while a field is being typed into or the app is starting.
 */
export const useCalendarPrefetch = () => {
  const month = toMonth(useDate());
  const coords = useCoords();
  const { twilight } = useFilter();
  const prefetch = useCallback(() => requestMonth(month, coords, twilight), [month, coords, twilight]);

  useEffect(() => {
    const timer = setTimeout(prefetch, PREFETCH_DELAY);
    return () => clearTimeout(timer);
  }, [prefetch]);
};
