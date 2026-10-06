import type { ParamValidators, Query } from '../router/router.types';

/** Query param of the open calendar: `cal=1`, left out while it is closed (the default) */
export const CALENDAR_PARAMS = ['cal'] as const;

export const calendarParamValidators: ParamValidators<(typeof CALENDAR_PARAMS)[number]> = {
  cal: value => value === '1' || value === '0'
};

export const calendarFromQuery = (query: Query, fallback: boolean): boolean =>
  'cal' in query ? query.cal === '1' : fallback;

export const calendarToQuery = (isOpen: boolean): Query => (isOpen ? { cal: '1' } : {});

export const parseStoredCalendar = (value: string | null) => value === 'true';
