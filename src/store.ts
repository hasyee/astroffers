import Store, { thunk } from 'repatch';
import { State } from './types';

const initialState: State = {
  filter: {
    date: Date.now(),
    magnitude: 11,
    latitude: 47,
    longitude: 20,
    twilight: -18,
    altitude: 20
  }
};

const store = new Store<State>(initialState).addMiddleware(thunk.withExtraArgument({}));

window['store'] = store;

export default store;
