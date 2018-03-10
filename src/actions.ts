import { ListItemProp } from './types';
import defaultState from './defaultState';
import sorters from './utils/sorters';
const typeMap = require('../data/types.json');

export const sort = (listItemProp: ListItemProp) => state => ({
  ...state,
  settings: { ...state.settings, sortBy: listItemProp },
  result: state.result ? { ...state.result, list: state.result.list.sort(sorters[listItemProp]) } : null
});

export const resetFilter = () => state => ({ ...state, filter: defaultState.filter });

export const changeFilter = (prop: string, value: number) => state => ({
  ...state,
  filter: { ...state.filter, [prop]: value }
});

export const toggleTypeFilter = (typeKey: string) => state => ({
  ...state,
  filter: {
    ...state.filter,
    types: {
      ...state.filter.types,
      [typeKey]: !state.filter.types[typeKey]
    }
  }
});

export const changeAllTypeFilter = (value: boolean) => state => ({
  ...state,
  filter: {
    ...state.filter,
    types: Object.keys(typeMap).reduce((acc, type) => ({ ...acc, [type]: value }), {})
  }
});

export const fetchLocation = () => state => async (dispatch, getState, { location }) => location.fetchLocation();

export const filterObjects = () => state => async (dispatch, getState, { api }) => {
  dispatch(state => ({ ...state, isFiltering: true }));
  const result = await api.filterObjects(getState().filter);
  const sortBy = getState().settings.sortBy;
  dispatch(state => ({ ...state, result: { ...result, list: result.list.sort(sorters[sortBy]) }, isFiltering: false }));
};

export const openDetails = (openedDetails: number) => state => ({ ...state, openedDetails });

export const closeDetails = () => state => ({ ...state, openedDetails: null });

export const trackScreen = (cd: string) => () => (dispatch, getState, { analytics }) =>
  analytics.send('screenview', { cd });

export const track = (ec: string, ea: string, el?: string, ev?: number) => () => (dispatch, getState, { analytics }) =>
  analytics.send('event', { ec, ea, el, ev });
