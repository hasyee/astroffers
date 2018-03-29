import { Filter, Result } from './types';
import { v1 as uuid } from 'uuid';

const worker = new Worker('static/worker.js');
let cid = null;

export const filterObjects = (filter: Filter): Promise<Result> =>
  new Promise((resolve, reject) => {
    cid = uuid();
    worker.onmessage = ({ data: response }) => {
      if (response.cid !== cid) return;
      resolve(response.result);
    };
    worker.postMessage({ cid, filter });
  });
