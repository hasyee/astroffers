import { State, Filter } from './types';

/* const reduceFilter = (reducer: (filter: Filter) => Filter) => (state: State): State => ({
  ...state,
  filter: reducer(state.filter)
});

export const changeDate = (date: number) => reduceFilter(state => ({ ...state, date }));
export const changeMagnitude = (magnitude: number) => reduceFilter(state => ({ ...state, magnitude }));
export const changeLatitude = (latitude: number) => reduceFilter(state => ({ ...state, latitude }));
export const changeLongitude = (longitude: number) => reduceFilter(state => ({ ...state, longitude }));
 */

export const changeFilter = (prop: string, value: number) => state => ({
  ...state,
  filter: { ...state.filter, [prop]: value }
});
