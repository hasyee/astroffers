import { useCallback, useMemo } from 'react';
import { useQuerySelector, useQuerySetter } from '../router/router.hooks';
import { type ParamValues, type QueryParam, readParam, readParams, writeParam } from './query.params';

/**
 * The value of a param of the query, its default when missing or unknown. Selected by its string, so it keeps its
 * identity while other params change — given a param of stable identity (e.g. a constant of a module).
 */
export const useQueryParam = <T>(param: QueryParam<T>): T => {
  const value = useQuerySelector(query => query[param.key]);
  return useMemo(() => readParam(value === undefined ? {} : { [param.key]: value }, param), [param, value]);
};

/** Setter of a param of the query (`replaceState`, no history entry), left out at its default */
export const useQueryParamSetter = <T>(param: QueryParam<T>) => {
  const setQuery = useQuerySetter();
  return useCallback(
    (update: T | ((value: T) => T)) =>
      setQuery(query =>
        writeParam(
          query,
          param,
          typeof update === 'function' ? (update as (value: T) => T)(readParam(query, param)) : update
        )
      ),
    [setQuery, param]
  );
};

/**
 * The values of a record of params (e.g. the fields of the filter), by their names. Selected by their strings, so the
 * record keeps its identity while other params change — given a record of stable identity (e.g. a module constant).
 */
export const useQueryParams = <P extends Record<string, QueryParam<unknown>>>(params: P): ParamValues<P> => {
  // the strings of the params as one string, a stable value to select
  const serialized = useQuerySelector(query =>
    JSON.stringify(Object.values(params).map(({ key }) => [key, query[key]]))
  );
  return useMemo(() => {
    // a missing param is `null` in the JSON
    const entries: [string, string | null][] = JSON.parse(serialized);
    const query = Object.fromEntries(entries.filter((entry): entry is [string, string] => entry[1] !== null));
    return readParams(query, params);
  }, [params, serialized]);
};

/**
 * Setter of a record of params, all of them in one update of the query (separate setters would update the state
 * param by param, e.g. recalculate with half of it): the values of some of them, or an update of all of their values
 */
export const useQueryParamsSetter = <P extends Record<string, QueryParam<unknown>>>(params: P) => {
  const setQuery = useQuerySetter();
  return useCallback(
    (update: Partial<ParamValues<P>> | ((values: ParamValues<P>) => Partial<ParamValues<P>>)) =>
      setQuery(query => {
        const values = typeof update === 'function' ? update(readParams(query, params)) : update;
        return Object.entries(values).reduce((query, [name, value]) => writeParam(query, params[name], value), query);
      }),
    [setQuery, params]
  );
};
