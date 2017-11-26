import { Filter, Result } from './types';

const worker = new Worker('static/worker.js');
let isWorkerBusy = false;

export const fetchLocation = (): Promise<{ latitude; longitude }> =>
  fetch('http://freegeoip.net/json')
    .then(response => response.json())
    .then(({ latitude, longitude }) => ({ latitude, longitude }));

export const filterObjects = (filter: Filter): Promise<Result> =>
  new Promise((resolve, reject) => {
    if (isWorkerBusy) return reject(new Error('Worker is busy'));
    isWorkerBusy = true;
    worker.onmessage = ({ data }) => {
      if (!isWorkerBusy) return reject(new Error('Worker is already done'));
      isWorkerBusy = false;
      resolve(data);
    };
    worker.postMessage(filter);
  });
