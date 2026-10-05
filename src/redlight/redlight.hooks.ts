import { useCallback, useLayoutEffect } from 'react';
import { useStatePart, useStatePartSetter } from '../query/query.hooks';
import type { Query } from '../router/router.types';
import { omitQuery } from '../router/router.utils';
import { RED_LIGHT_PARAMS, redLightFromQuery, redLightToQuery } from './redlight.utils';

const getRedLight = (query: Query) => redLightFromQuery(query, false);
const parseRedLight = (serialized: string) => serialized === 'true';
// the param is left out in the normal mode, so it is replaced
const setQueryRedLight = (query: Query, isRedLight: boolean): Query => ({
  ...omitQuery(query, RED_LIGHT_PARAMS),
  ...redLightToQuery(isRedLight)
});

/** The red light mode, for the eyes adapted to the dark in the field */
export const useRedLight = () => {
  const isRedLight = useStatePart(getRedLight, String, parseRedLight);
  const setRedLight = useStatePartSetter(getRedLight, setQueryRedLight);
  const toggle = useCallback(() => setRedLight(isRedLight => !isRedLight), [setRedLight]);
  return [isRedLight, toggle] as const;
};

/**
 * Turns the whole page red in the red light mode: a filter on the root element (`index.scss`, the SVG filter in
 * `index.html`), which covers the dialogs and drawers rendered into the body too, without breaking their fixed
 * positions (only the root is exempt from the containing block of a filter). Before the paint, not to flash.
 */
export const useRedLightMode = () => {
  const [isRedLight] = useRedLight();
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('red-light', isRedLight);
  }, [isRedLight]);
};
