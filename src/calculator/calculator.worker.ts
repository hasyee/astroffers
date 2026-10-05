import type { CalcRequest, CalcResponse, NgcObject } from './calculator.types';
import catalog from '../catalog/catalog.json';
import calculate, { calculateNight } from './calculator';

self.onmessage = ({ data: request }: MessageEvent<CalcRequest>) => {
  const response: CalcResponse =
    request.type === 'night'
      ? { jobId: request.jobId, type: 'night', night: calculateNight(request.params) }
      : { jobId: request.jobId, type: 'result', result: calculate(catalog as NgcObject[], request.params) };
  self.postMessage(response);
};
