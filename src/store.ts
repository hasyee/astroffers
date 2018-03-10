import Store, { thunk } from 'repatch';
import { State } from './types';
import * as api from './api';
import * as location from './location';
import analytics from './analytics';
import defaultState from './defaultState';

const storedFilterStr = window.localStorage.getItem('filter');
const storedFilter = storedFilterStr ? JSON.parse(storedFilterStr) : {};

const storedSettingsStr = window.localStorage.getItem('settings');
const storedSettings = storedSettingsStr ? JSON.parse(storedSettingsStr) : {};

const initialState: State = {
  ...defaultState,
  filter: { ...defaultState.filter, ...storedFilter, date: Date.now() },
  settings: { ...defaultState.settings, ...storedSettings }
};

const store = new Store<State>(initialState).addMiddleware(thunk.withExtraArgument({ api, location, analytics }));

export default store;

window['store'] = store;

store.subscribe(() => {
  const filter = JSON.stringify(store.getState().filter);
  window.localStorage.setItem('filter', filter);
  const settings = JSON.stringify(store.getState().settings);
  window.localStorage.setItem('settings', settings);
});
