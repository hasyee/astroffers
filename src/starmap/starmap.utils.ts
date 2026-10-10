import { createBoolParam } from '../query/query.params';

/**
 * Query params of the orientation of the star map, as a telescope shows the sky, in the query on its route only:
 * `fh=1` mirrors it horizontally, `fv=1` vertically
 */
export const FLIP_PARAMS = {
  horizontal: createBoolParam('fh'),
  vertical: createBoolParam('fv')
};
