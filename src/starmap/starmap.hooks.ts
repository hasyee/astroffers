import { useQueryParams, useQueryParamsSetter } from '../query/query.hooks';
import { FLIP_PARAMS } from './starmap.utils';

export const useFlip = () => useQueryParams(FLIP_PARAMS);

export const useFlipSetter = () => useQueryParamsSetter(FLIP_PARAMS);
