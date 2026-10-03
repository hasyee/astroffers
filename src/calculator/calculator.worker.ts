import type { CalcRequest, CalcResponse, NgcObject } from './calculator.types';
import catalog from '../catalog/catalog.json';
import calculate from './calculator';

self.onmessage = ({ data: { jobId, params } }: MessageEvent<CalcRequest>) => {
  const response: CalcResponse = { jobId, result: calculate(catalog as NgcObject[], params) };
  self.postMessage(response);
};
