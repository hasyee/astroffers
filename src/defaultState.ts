import { State, TypeFilter } from './types';
const typeMap = require('../data/types.json');

export default {
  filter: {
    date: Date.now(),
    magnitude: 10,
    latitude: 47,
    longitude: 19,
    twilight: -18,
    altitude: 20,
    moonless: true,
    types: Object.keys(typeMap).reduce((acc, type) => ({ ...acc, [type]: true }), {})
  }
} as State;
