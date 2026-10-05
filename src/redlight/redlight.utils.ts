import type { Query } from '../router/router.types';

/** Query param of the red light mode: `red=1`, left out in the normal mode (the default) */
export const RED_LIGHT_PARAMS = ['red'] as const;

export const redLightFromQuery = (query: Query, fallback: boolean): boolean =>
  'red' in query ? query.red === '1' : fallback;

export const redLightToQuery = (isRedLight: boolean): Query => (isRedLight ? { red: '1' } : {});

export const parseStoredRedLight = (value: string | null) => value === 'true';
