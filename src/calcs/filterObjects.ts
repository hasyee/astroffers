import { NgcObject, NgcInfo, Interval } from './types';
import getNgcInfo from './getNgcInfo';
import { getLocation } from './units';

import { Filter } from '../types';

export default (
  ngcObjects: NgcObject[],
  { date, latitude, longitude, altitude, brightnessFilter, magnitude, surfaceBrightness, types: typeFilter }: Filter,
  night: Interval
): NgcInfo[] => {
  if (!night) return [];
  const location = getLocation(latitude, longitude);
  return (
    ngcObjects
      .filter(object => {
        const types = object.type.split('+');
        return (
          (brightnessFilter === 'magnitude'
            ? Number.isFinite(object.magnitude) && object.magnitude < magnitude
            : Number.isFinite(object.surfaceBrightness) && object.surfaceBrightness < surfaceBrightness) &&
          types.some(t => typeFilter[t])
        );
      })
      .map(getNgcInfo(date, night, location, altitude))
      .filter(ngcInfo => ngcInfo.intersection)
  );
};
