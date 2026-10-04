import { useEffect, useMemo, useRef, useState } from 'react';
import CalendarWorker from '../calculator/calculator.calendar.worker?worker';
import type { CalendarDay, CalendarRequest, CalendarResponse, Timestamp } from '../calculator/calculator.types';
import { useFilter } from '../filter/filter.hooks';
import { useCoords } from '../location/location.hooks';

/** The week starts on Monday */
const WEEK_OFFSET = 1;

const noDays: CalendarDay[] = [];

/** Days of the month with their nights, calculated in a worker at the location and the twilight of the filter */
export const useCalendarDays = (month: Timestamp) => {
  const jobId = useRef(0);
  const worker = useMemo(() => new CalendarWorker(), []);
  const coords = useCoords();
  const twilight = useFilter().twilight;
  const [days, setDays] = useState(noDays);

  useEffect(() => {
    worker.onmessage = ({ data }: MessageEvent<CalendarResponse>) => {
      if (data.jobId === jobId.current) setDays(data.days);
    };
  }, [worker]);

  useEffect(() => {
    const request: CalendarRequest = {
      jobId: ++jobId.current,
      params: { month, weekOffset: WEEK_OFFSET, coords, twilight }
    };
    worker.postMessage(request);
  }, [worker, month, coords, twilight]);

  useEffect(() => () => worker.terminate(), [worker]);

  return days;
};
