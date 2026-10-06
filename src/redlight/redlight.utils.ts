import { createBoolParam } from '../query/query.params';

/** Query param of the red light mode: `red=1`, left out in the normal mode (the default) */
export const RED_LIGHT_PARAM = createBoolParam('red');
