import type { CalcParams, CalcResult, NgcObject } from './calculator.types';
import { getNightInfo } from './calculator.night';
import { getObjects } from './calculator.ngc';
import { getLocation } from './calculator.units';

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
