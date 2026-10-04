import type { CalendarRequest, CalendarResponse } from './calculator.types';
import calculateCalendar from './calculator.calendar';

self.onmessage = ({ data: { key, params } }: MessageEvent<CalendarRequest>) => {
  const response: CalendarResponse = { key, month: params.month, days: calculateCalendar(params) };
  self.postMessage(response);
};
