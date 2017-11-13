import Store, { thunk } from 'repatch';
import { State } from './types';
import { fetchLocation } from './api';

const initialState: State = {
  filter: {
    date: Date.now(),
    magnitude: 10,
    latitude: 47,
    longitude: 19,
    twilight: -18,
    altitude: 20
  }
};

const store = new Store<State>(initialState).addMiddleware(thunk.withExtraArgument({ fetchLocation }));

window['store'] = store;

export default store;
