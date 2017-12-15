import { stringify } from 'qs';
import { remote } from 'electron';
import { machineIdSync } from 'node-machine-id';
import Analytics from 'electron-ga';

export default new Analytics('UA-110942439-1');
