import { State, Filter } from './types';
import { getLocation } from './calcs/units';
import defaultState from './defaultState';
import { getNightInfo } from './selectors';

export const resetFilter = () => state => ({ ...state, filter: defaultState.filter });

export const changeFilter = (prop: string, value: number) => state => ({
  ...state,
  filter: { ...state.filter, [prop]: value }
});

export const fetchLocation = () => state => async (dispatch, getState, { fetchLocation }) => {
  const { latitude, longitude } = await fetchLocation();
  dispatch(changeFilter('latitude', latitude));
  dispatch(changeFilter('longitude', longitude));
};

export const filterObjects = () => state => async (dispatch, getState, { filterObjects }) => {
  const nightInfo = getNightInfo(getState());
  const result = await filterObjects(getState().filter, nightInfo.moonNight);
  dispatch(state => ({ ...state, result }));
};
