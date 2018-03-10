import { State, ListItemProp } from './types';
import { Thunk } from 'repatch';
import defaultState from './defaultState';
import sorters from './utils/sorters';
const typeMap = require('../data/types.json');

export const sort = (listItemProp: ListItemProp) => (state: State): State => ({
  ...state,
  settings: { ...state.settings, sortBy: listItemProp },
  result: state.result ? { ...state.result, list: state.result.list.sort(sorters[listItemProp]) } : null
});

export const resetFilter = () => (state: State): State => ({ ...state, filter: defaultState.filter });

export const changeFilter = (prop: string, value: number) => (state: State): State => ({
  ...state,
  filter: { ...state.filter, [prop]: value }
});

export const toggleTypeFilter = (typeKey: string) => (state: State): State => ({
  ...state,
  filter: {
    ...state.filter,
    types: {
      ...state.filter.types,
      [typeKey]: !state.filter.types[typeKey]
    }
  }
});

export const changeAllTypeFilter = (value: boolean) => (state: State): State => ({
  ...state,
  filter: {
    ...state.filter,
    types: Object.keys(typeMap).reduce((acc, type) => ({ ...acc, [type]: value }), {})
  }
});

export const fetchLocation = () => (state: State) => async (dispatch, getState, { location }) =>
  location.fetchLocation();

export const filterObjects = () => (state: State) => async (dispatch, getState, { api }) => {
  dispatch((state: State): State => ({ ...state, isFiltering: true }));
  const result = await api.filterObjects(getState().filter);
  const sortBy = getState().settings.sortBy;
  dispatch((state: State): State => ({
    ...state,
    result: { ...result, list: result.list.sort(sorters[sortBy]) },
    isFiltering: false
  }));
};

export const openDetails = (openedDetails: number) => (state: State): State => ({ ...state, openedDetails });

export const closeDetails = () => (state: State): State => ({ ...state, openedDetails: null });

export const trackScreen = (cd: string) => () => (dispatch, getState, { analytics }) =>
  analytics.send('screenview', { cd });

export const track = (ec: string, ea: string, el?: string, ev?: number) => () => (dispatch, getState, { analytics }) =>
  analytics.send('event', { ec, ea, el, ev });
