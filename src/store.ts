import Store, { thunk } from 'repatch';
import { State } from './types';

const initialState: State = {
  filter: {
    date: Date.now(),
    magnitude: 11,
    latitude: 47,
    longitude: 20
  }
};

export default new Store<State>(initialState).addMiddleware(thunk.withExtraArgument({}));
