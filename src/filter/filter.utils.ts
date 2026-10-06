import type { BrightnessType, ObjectFilter, ObservationWindow, SetFilter } from '../calculator/calculator.types';
import { constellations, objectTypes } from '../catalog/catalog.utils';
import { createEnumParam, createNumParam, type ParamValues, type QueryParam } from '../query/query.params';

const selectAll = (keys: Record<string, string>, value = true): SetFilter =>
  Object.fromEntries(Object.keys(keys).map(key => [key, value]));

export const selectAllTypes = (value: boolean) => selectAll(objectTypes, value);

export const selectAllConstellations = (value: boolean) => selectAll(constellations, value);

export const defaultFilter: ObjectFilter = {
  observationTime: 30,
  twilight: -18,
  altitude: 20,
  observationWindow: 'astroNight',
  brightnessLimitType: 'magnitude',
  magnitude: 10,
  surfaceBrightness: 14,
  types: selectAllTypes(true),
  constellations: selectAllConstellations(true)
};

export const countSelected = (setFilter: SetFilter) => Object.values(setFilter).filter(selected => selected).length;

/** The param of a set: its selected keys, by default all of them (left out), or the ones left out (`-` before each) */
const createSetParam = (key: string, setFilter: SetFilter) =>
  createEnumParam(key, Object.keys(setFilter), Object.keys(setFilter), { isArray: true });

/** Query params of the filter, by its fields, each left out at its default value; a set as the list of its keys */
export const FILTER_PARAMS = {
  altitude: createNumParam('alt', defaultFilter.altitude, { min: -90, max: 90 }),
  brightnessLimitType: createEnumParam(
    'blt',
    { magnitude: 'mag', surfaceBrightness: 'sb' } satisfies Record<BrightnessType, string>,
    defaultFilter.brightnessLimitType
  ),
  magnitude: createNumParam('mag', defaultFilter.magnitude, { min: -30, max: 30 }),
  surfaceBrightness: createNumParam('sb', defaultFilter.surfaceBrightness, { min: -30, max: 30 }),
  twilight: createNumParam('tw', defaultFilter.twilight, { min: -90, max: 0 }),
  observationTime: createNumParam('ot', defaultFilter.observationTime, { min: 0, max: 1440 }),
  observationWindow: createEnumParam(
    'ow',
    { moonlessNight: 'man', astroNight: 'an', night: 'n' } satisfies Record<ObservationWindow, string>,
    defaultFilter.observationWindow
  ),
  types: createSetParam('types', defaultFilter.types),
  constellations: createSetParam('const', defaultFilter.constellations)
} satisfies {
  [K in keyof ObjectFilter]: QueryParam<ObjectFilter[K] extends SetFilter ? string[] : ObjectFilter[K]>;
};

type FilterParamValues = ParamValues<typeof FILTER_PARAMS>;

const toSetFilter = (selected: string[], all: SetFilter): SetFilter =>
  Object.fromEntries(Object.keys(all).map(key => [key, selected.includes(key)]));

const toSelected = (setFilter: SetFilter) => Object.keys(setFilter).filter(key => setFilter[key]);

/** The filter of the values of its params */
export const toFilter = ({ types, constellations, ...fields }: FilterParamValues): ObjectFilter => ({
  ...fields,
  types: toSetFilter(types, defaultFilter.types),
  constellations: toSetFilter(constellations, defaultFilter.constellations)
});

/** The values of the params of the filter */
export const toFilterParamValues = ({ types, constellations, ...fields }: ObjectFilter): FilterParamValues => ({
  ...fields,
  types: toSelected(types),
  constellations: toSelected(constellations)
});
