import { useEffect, useMemo, useRef } from 'react';
import CalcWorker from '../calculator/calculator.worker?worker';
import type { CalcRequest, CalcResponse, NgcInfo } from '../calculator/calculator.types';
import { useDate } from '../date/date.hooks';
import { useCoords } from '../location/location.hooks';
import { useFilter } from '../filter/filter.hooks';
import { createStateContext, useStateSelector, useStateSetter } from '../provider/state.hooks';
import type { ResultState } from './result.types';

/** Delay of the list after the last change of the location or the filter, which are typed into */
const DEBOUNCE = 300;

const noList: NgcInfo[] = [];

export const ResultContext = createStateContext<ResultState>({ night: null, result: null, isCalculating: true });

export const useResult = () => useStateSelector(ResultContext, state => state.result);

export const useIsCalculating = () => useStateSelector(ResultContext, state => state.isCalculating);

export const useResultList = () => useStateSelector(ResultContext, state => state.result?.list ?? noList);

/** The latest night, calculated before the list, e.g. for the summary */
export const useNight = () => useStateSelector(ResultContext, state => state.night);

/** The night of the displayed list, e.g. for the details of its objects */
export const useResultNightInfo = () => useStateSelector(ResultContext, state => state.result?.nightInfo ?? null);

/** Parameters of the displayed list (not the current filter, which may be newer) */
export const useResultParams = () => useStateSelector(ResultContext, state => state.result?.params ?? null);

/**
 * Recalculates in a worker whenever the date, the location or the filter changes: the night at once (it is quick,
 * and the summary shows it), then the list, also at once for a new date (chosen in the calendar), after a debounce
 * otherwise (e.g. typing into a field of the filter). Responses of outdated requests are dropped by their `jobId`.
 */
export const useCalculation = () => {
  const nightJobId = useRef(0);
  const jobId = useRef(0);
  const requestedDate = useRef<number | null>(null);
  const worker = useMemo(() => new CalcWorker(), []);
  const date = useDate();
  const coords = useCoords();
  const filter = useFilter();
  const setState = useStateSetter(ResultContext);

  useEffect(() => {
    worker.onmessage = ({ data: response }: MessageEvent<CalcResponse>) => {
      if (response.type === 'night') {
        if (response.jobId === nightJobId.current) setState(state => ({ ...state, night: response.night }));
      } else if (response.jobId === jobId.current) {
        setState(state => ({ ...state, result: response.result, isCalculating: false }));
      }
    };
  }, [worker, setState]);

  const { twilight } = filter;
  useEffect(() => {
    const request: CalcRequest = { jobId: ++nightJobId.current, type: 'night', params: { date, coords, twilight } };
    worker.postMessage(request);
  }, [worker, date, coords, twilight]);

  useEffect(() => {
    const request: CalcRequest = { jobId: ++jobId.current, type: 'result', params: { date, coords, filter } };
    setState(state => (state.isCalculating ? state : { ...state, isCalculating: true }));
    const timer = setTimeout(
      () => {
        requestedDate.current = date;
        worker.postMessage(request);
      },
      date === requestedDate.current ? DEBOUNCE : 0
    );
    return () => clearTimeout(timer);
  }, [worker, date, coords, filter, setState]);

  useEffect(() => () => worker.terminate(), [worker]);
};
