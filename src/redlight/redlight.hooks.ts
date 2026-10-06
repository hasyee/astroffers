import { useCallback, useLayoutEffect } from 'react';
import { useQueryParam, useQueryParamSetter } from '../query/query.hooks';
import { RED_LIGHT_PARAM } from './redlight.utils';

/** The red light mode, for the eyes adapted to the dark in the field */
export const useRedLight = () => {
  const isRedLight = useQueryParam(RED_LIGHT_PARAM);
  const setRedLight = useQueryParamSetter(RED_LIGHT_PARAM);
  const toggle = useCallback(() => setRedLight(isRedLight => !isRedLight), [setRedLight]);
  return [isRedLight, toggle] as const;
};

/**
 * Turns the whole page red in the red light mode: the class of the root element shows the two layers over everything
 * (`index.html`, `index.scss`), the dialogs and drawers included. Before the paint, not to flash.
 */
export const useRedLightMode = () => {
  const [isRedLight] = useRedLight();
  useLayoutEffect(() => {
    document.documentElement.classList.toggle('red-light', isRedLight);
  }, [isRedLight]);
};
