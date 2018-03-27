import { NgcObject, NgcInfo, Interval, Timestamp, Deg, Min, BirghtnessType, SetFilter } from './types';
import getNgcInfo from './getNgcInfo';
import { getLocation } from './units';
const ngcObjects: NgcObject[] = require('../../data/ngc.json');

import { Filter } from '../types';

export type Options = {
  date: Timestamp;
  latitude: Deg;
  longitude: Deg;
  observationTime: Min;
  altitude: Deg;
  brightnessFilter: BirghtnessType;
  magnitude: number;
  surfaceBrightness: number;
  types: SetFilter;
  constellations: SetFilter;
  night: Interval;
};

export default ({
  date,
  latitude,
  longitude,
  observationTime,
  altitude,
  brightnessFilter,
  magnitude,
  surfaceBrightness,
  types,
  constellations,
  night
}: Options): NgcInfo[] => {
  if (!night) return [];
  const location = getLocation(latitude, longitude);
  return ngcObjects
    .filter(object => {
      return (
        (brightnessFilter === 'magnitude'
          ? Number.isFinite(object.magnitude) && object.magnitude < magnitude
          : Number.isFinite(object.surfaceBrightness) && object.surfaceBrightness < surfaceBrightness) &&
        object.types.some(t => types[t]) &&
        constellations[object.constellation]
      );
    })
    .map(getNgcInfo(date, night, location, altitude))
    .filter(ngcInfo => ngcInfo.intersection && observationTime * 60 * 1000 < ngcInfo.sum);
};
