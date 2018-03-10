import { State } from './types';

export const getAdjacentDetails = direction => (state: State): number => {
  if (!state.openedDetails || !state.result || !state.result.list || state.result.list.length === 0) return null;
  const index = state.result.list.findIndex(ngcInfo => ngcInfo.object.ngc === state.openedDetails);
  return state.result.list[index + direction] ? state.result.list[index + direction].object.ngc : null;
};
