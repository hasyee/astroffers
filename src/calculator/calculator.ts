import type {
  CalcParams,
  CalcResult,
  Interval,
  NgcObject,
  NightParams,
  NightResult,
  Timestamp
} from './calculator.types';
import { getSolarSystemObjects } from '../solar/solar.utils';
import { getNightInfo } from './calculator.night';
import { getObjects } from './calculator.ngc';
import { toMidnight } from './calculator.time';
import { getLocation } from './calculator.units';

/** The middle of the night, the time of the positions of the bodies of the Solar System; midnight for a polar one */
const getMiddle = ({ start, end }: Interval, date: Timestamp) =>
  Number.isFinite(start) && Number.isFinite(end) ? (start + end) / 2 : toMidnight(date);

export const calculateNight = (params: NightParams): NightResult => {
  const { date, coords, twilight } = params;
  return { params, nightInfo: getNightInfo(date, coords.lat, coords.lng, twilight) };
};

export default (catalog: NgcObject[], params: CalcParams): CalcResult => {
  const {
    date,
    coords: { lat, lng },
    filter
  } = params;
  const nightInfo = getNightInfo(date, lat, lng, filter.twilight);
  const night = nightInfo[filter.observationWindow];
  const objects = night ? [...catalog, ...getSolarSystemObjects(getMiddle(night, date))] : catalog;
  const list = getObjects(objects, date, getLocation(lat, lng), night, filter);
  return { params, nightInfo, list };
};
