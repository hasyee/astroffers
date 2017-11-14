import { Filter } from './types';
import { NgcInfo, Interval } from './calcs/types';

const worker = new Worker('worker.js');
let isWorkerBusy = false;

export const fetchLocation = (): Promise<{ latitude; longitude }> =>
  fetch('http://freegeoip.net/json')
    .then(response => response.json())
    .then(({ latitude, longitude }) => ({ latitude, longitude }));

export const filterObjects = (filter: Filter, night: Interval): Promise<NgcInfo[]> =>
  new Promise((resolve, reject) => {
    //if (isWorkerBusy) return reject(new Error('Worker is busy'));
    //isWorkerBusy = true;
    worker.onmessage = ({ data }) => {
      //isWorkerBusy = false;
      resolve(data);
    };
    worker.postMessage({ filter, night });
  });
