import type { CalcParams, CalcResult, NgcObject, NightParams, NightResult } from './calculator.types';
import { getNightInfo } from './calculator.night';
import { getObjects } from './calculator.ngc';
import { getLocation } from './calculator.units';

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
  const night = filter.moonless ? nightInfo.moonlessNight : nightInfo.astroNight;
  const list = getObjects(catalog, date, getLocation(lat, lng), night, filter);
  return { params, nightInfo, list };
};
