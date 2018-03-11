import { NgcObject, NgcInfo, Interval } from './types';
import getNgcInfo from './getNgcInfo';
import { getLocation } from './units';

import { Filter } from '../types';

export default (
  ngcObjects: NgcObject[],
  {
    date,
    latitude,
    longitude,
    observationTime,
    altitude,
    brightnessFilter,
    magnitude,
    surfaceBrightness,
    types: typeFilter,
    constellations: constellationFilter
  }: Filter,
  night: Interval
): NgcInfo[] => {
  if (!night) return [];
  const location = getLocation(latitude, longitude);
  return ngcObjects
    .filter(object => {
      return (
        (brightnessFilter === 'magnitude'
          ? Number.isFinite(object.magnitude) && object.magnitude < magnitude
          : Number.isFinite(object.surfaceBrightness) && object.surfaceBrightness < surfaceBrightness) &&
        object.types.some(t => typeFilter[t]) &&
        constellationFilter[object.constellation]
      );
    })
    .map(getNgcInfo(date, night, location, altitude))
    .filter(ngcInfo => ngcInfo.intersection && observationTime * 60 * 1000 < ngcInfo.sum);
};
