import { createStateContext, useStateSetter, useStateValue } from '../provider/state.hooks';
import { getToday } from './date.utils';

export const DateContext = createStateContext(getToday());

export const useDate = () => useStateValue(DateContext);

export const useDateSetter = () => useStateSetter(DateContext);
