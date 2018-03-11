import { State, ListItemProp } from './types';
const typeMap = require('../data/types.json');
const constellationMap = require('../data/constellations.json');
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
    types: Object.keys(typeMap).reduce((acc, type) => ({ ...acc, [type]: true }), {}),
    constellations: Object.keys(constellationMap).reduce((acc, cons) => ({ ...acc, [cons]: true }), {})
  },
  settings: {
    sortBy: ListItemProp.MAX
  },
  result: null,
  isFiltering: false,
  openedDetails: null
} as State;
