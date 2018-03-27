import { State, ListItemProp } from './types';
import { objectTypes, constellations } from './calcs';
import { machineIdSync } from 'node-machine-id';

export default {
  packageJson: require('../package.json'),
  filter: {
    date: Date.now(),
    latitude: 47,
    longitude: 19,
    observationTime: 60,
    twilight: -18,
    altitude: 20,
    moonless: true,
    brightnessFilter: 'magnitude',
    magnitude: 10,
    surfaceBrightness: 14,
    types: Object.keys(objectTypes).reduce((acc, type) => ({ ...acc, [type]: true }), {}),
    constellations: Object.keys(constellations).reduce((acc, cons) => ({ ...acc, [cons]: true }), {})
  },
  settings: {
    sortBy: ListItemProp.MAX
  },
  result: null,
  isFiltering: false,
  openedDetails: null
} as State;
