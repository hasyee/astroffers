import { useEffect, useMemo, useRef } from 'react';
import CalcWorker from '../calculator/calculator.worker?worker';
import type { CalcRequest, CalcResponse, NgcInfo } from '../calculator/calculator.types';
import { useDate } from '../date/date.hooks';
import { useCoords } from '../location/location.hooks';
import { useFilter } from '../filter/filter.hooks';
import { createStateContext, useStateSelector, useStateSetter } from '../provider/state.hooks';
import type { ResultState } from './result.types';

/** Delay of the calculation after the last change of its parameters */
const DEBOUNCE = 300;

const noList: NgcInfo[] = [];

export const ResultContext = createStateContext<ResultState>({ result: null, isCalculating: true });

export const useResult = () => useStateSelector(ResultContext, state => state.result);

export const useIsCalculating = () => useStateSelector(ResultContext, state => state.isCalculating);

export const useResultList = () => useStateSelector(ResultContext, state => state.result?.list ?? noList);

export const useNightInfo = () => useStateSelector(ResultContext, state => state.result?.nightInfo ?? null);

/** Parameters of the displayed result (not the current filter, which may be newer) */
export const useResultParams = () => useStateSelector(ResultContext, state => state.result?.params ?? null);

/** Recalculates the result in a worker whenever the date, the location or the filter changes */
export const useCalculation = () => {
  const jobId = useRef(0);
  const worker = useMemo(() => new CalcWorker(), []);
  const date = useDate();
  const coords = useCoords();
  const filter = useFilter();
  const setState = useStateSetter(ResultContext);

  useEffect(() => {
    worker.onmessage = ({ data: { jobId: responseJobId, result } }: MessageEvent<CalcResponse>) => {
      if (responseJobId !== jobId.current) return;
      setState({ result, isCalculating: false });
    };
  }, [worker, setState]);

  useEffect(() => {
    const request: CalcRequest = { jobId: ++jobId.current, params: { date, coords, filter } };
    setState(state => (state.isCalculating ? state : { ...state, isCalculating: true }));
    const timer = setTimeout(() => worker.postMessage(request), DEBOUNCE);
    return () => clearTimeout(timer);
  }, [worker, date, coords, filter, setState]);

  useEffect(() => () => worker.terminate(), [worker]);
};
