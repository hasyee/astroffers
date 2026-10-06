import { createBoolParam } from '../query/query.params';

/** Query param of the open calendar: `cal=1`, left out while it is closed (the default) */
export const CALENDAR_PARAM = createBoolParam('cal');
