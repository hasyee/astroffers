import clone = require('clone');
import { Filter, Result } from '../types';
import getNightInfo from '../calcs/getNightInfo';
import filterObjects from '../calcs/filterObjects';

export default (filter: Filter): Result => {
  const {
    date,
    latitude,
    longitude,
    twilight,
    observationTime,
    altitude,
    brightnessFilter,
    magnitude,
    surfaceBrightness,
    types,
    constellations
  } = filter;
  const nightInfo = getNightInfo(date, latitude, longitude, twilight);
  const list = filterObjects({
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
    night: filter.moonless ? nightInfo.moonlessNight : nightInfo.astroNight
  });
  return { nightInfo, list, filter: clone(filter) };
};
