import { State, Filter } from './types';
import { getLocation } from './calcs/units';

export const changeFilter = (prop: string, value: number) => state => ({
  ...state,
  filter: { ...state.filter, [prop]: value }
});

export const fetchLocation = () => state => async (dispatch, getstate, { fetchLocation }) => {
  const { latitude, longitude } = await fetchLocation();
  dispatch(changeFilter('latitude', latitude));
  dispatch(changeFilter('longitude', longitude));
};
