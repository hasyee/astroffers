import { State, Filter } from './types';
import { getLocation } from './calcs/units';
import defaultState from './defaultState';
const typeMap = require('../data/types.json');

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

export const fetchLocation = () => state => async (dispatch, getState, { api }) => {
  const { latitude, longitude } = await api.fetchLocation();
  dispatch(changeFilter('latitude', latitude));
  dispatch(changeFilter('longitude', longitude));
};

export const filterObjects = () => state => async (dispatch, getState, { api }) => {
  dispatch(state => ({ ...state, isFiltering: true }));
  const result = await api.filterObjects(getState().filter);
  dispatch(state => ({ ...state, result, isFiltering: false }));
};

export const openDetails = (openedDetails: number) => state => ({ ...state, openedDetails });

export const closeDetails = () => state => ({ ...state, openedDetails: null });

export const trackScreen = (screen: string) => () => async (dispatch, getState, { analytics }) => {
  const version = getState().appInfo.version;
  const clientId = getState().appInfo.clientId;
  console.log('trackScreen', screen, version, clientId);
  analytics.screen('astroffers', version, 'org.electron.astroffers', 'org.electron.astroffers', screen, clientId);
};

export const track = (category: string, action: string, params: any = {}) => () => async (
  dispatch,
  getState,
  { analytics }
) => {
  const eventParams = { ...params, clientId: getState().appInfo.clientId };
  console.log('track', category, action, eventParams);
  //analytics.event(category, action, eventParams);
};
