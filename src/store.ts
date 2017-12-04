import Store, { thunk } from 'repatch';
import { State } from './types';
import * as api from './api';
import * as analytics from './analytics';
import defaultState from './defaultState';

const storedFilterStr = window.localStorage.getItem('filter');
const storedFilter = storedFilterStr ? JSON.parse(storedFilterStr) : {};

const initialState: State = {
  ...defaultState,
  filter: { ...defaultState.filter, ...storedFilter, date: Date.now() }
};

const store = new Store<State>(initialState).addMiddleware(thunk.withExtraArgument({ api, analytics }));

export default store;

window['store'] = store;

store.subscribe(() => {
  const filter = JSON.stringify(store.getState().filter);
  window.localStorage.setItem('filter', filter);
});
