import type { CalendarRequest, CalendarResponse } from './calculator.types';
import calculateCalendar from './calculator.calendar';

self.onmessage = ({ data: { jobId, params } }: MessageEvent<CalendarRequest>) => {
  const response: CalendarResponse = { jobId, days: calculateCalendar(params) };
  self.postMessage(response);
};
