import { State, TypeFilter } from './types';
const typeMap = require('../data/types.json');

export default {
  filter: {
    date: Date.now(),
    latitude: 47,
    longitude: 19,
    twilight: -18,
    altitude: 20,
    moonless: true,
    brightnessFilter: 'magnitude',
    magnitude: 10,
    surfaceBrightness: 14,
    types: Object.keys(typeMap).reduce((acc, type) => ({ ...acc, [type]: true }), {})
  }
} as State;
