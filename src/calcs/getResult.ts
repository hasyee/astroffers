import { Filter, Result } from '../types';
import getNightInfo from './getNightInfo';
import filterObjects from './filterObjects';
const catalog = require('../../data/ngc.json');

export default (filter: Filter): Result => {
  const nightInfo = getNightInfo(filter);
  const list = filterObjects(catalog, filter, nightInfo.moonNight);
  return { nightInfo, list };
};
