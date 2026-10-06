import moment from 'moment';
import type { Query } from '../router/router.types';

/**
 * A param of the query holding a value of the state: its key, its default (left out of the query) and its codec. A
 * missing or unknown value (`parse` returns `undefined`) reads as the default; `null` is left out too. The type of a
 * param with a non-null default excludes `null`.
 */
export type QueryParam<T, K extends string = string> = {
  key: K;
  defaultValue: T;
  /** Its value is a list, comma separated in the query (so its values may not have a comma) */
  isArray: boolean;
  // methods, not to be checked contravariantly: a list of params of different types is `QueryParam<unknown>[]`
  parse(value: string): T | undefined;
  serialize(value: NonNullable<T>): string;
  /** By their params; a list as a set, regardless of the order of its values */
  isEqual(a: NonNullable<T>, b: NonNullable<T>): boolean;
};

/** The values of a record of params, by their names */
export type ParamValues<P extends Record<string, QueryParam<unknown>>> = {
  [N in keyof P]: P[N] extends QueryParam<infer T> ? T : never;
};

/** The value of a param of the values of the type: one of them, or a list of them with `isArray` */
export type ParamValue<E, A extends boolean> = A extends true ? E[] : E;

export type ArrayOption<A extends boolean> = { isArray?: A };

/** The codec of one value */
type Codec<E> = { parse: (value: string) => E | undefined; serialize: (value: E) => string };

const isDefined = <E>(value: E | undefined): value is E => value !== undefined;

/** How a list of values is read: in its order, or as a set (no duplicates, the order irrelevant) */
type ArrayKind<E> = { isSet: false } | { isSet: true; relativeTo: E[] | null };

/**
 * The codec of a list of the values: empty, or having one known value at least, of which the unknown ones are dropped.
 * A set is without duplicates; relative to a set (the default of the param), a subset of it may be given by the values
 * left out of it (`-` before each, e.g. `-Aql,-Gem`), when that is the shorter; a list mixing them is unknown.
 */
const createArrayCodec = <E>(codec: Codec<E>, kind: ArrayKind<E>): Codec<E[]> => {
  const relativeTo = kind.isSet ? kind.relativeTo : null;
  const all = relativeTo?.map(codec.serialize) ?? null;
  const toValues = (items: string[]) => {
    const values = items.map(codec.parse).filter(isDefined);
    return kind.isSet ? values.filter((value, index) => values.indexOf(value) === index) : values;
  };
  return {
    parse: value => {
      if (value === '') return [];
      const items = value.split(',');
      const leftOut = items.filter(item => item.startsWith('-'));
      if (relativeTo === null || leftOut.length === 0) {
        const values = toValues(items);
        return values.length > 0 ? values : undefined;
      }
      if (leftOut.length < items.length) return undefined;
      const leftOutParams = toValues(leftOut.map(item => item.slice(1))).map(codec.serialize);
      return leftOutParams.length > 0
        ? relativeTo.filter(value => !leftOutParams.includes(codec.serialize(value)))
        : undefined;
    },
    serialize: values => {
      const params = values.map(codec.serialize);
      const leftOut = all?.filter(param => !params.includes(param)) ?? [];
      const isSubset = all !== null && params.every(param => all.includes(param));
      return isSubset && leftOut.length > 0 && leftOut.length < params.length
        ? leftOut.map(param => `-${param}`).join(',')
        : params.join(',');
    }
  };
};

/** A param of one value, or of a list of them (see `createArrayCodec`) */
const createParam = <E, K extends string, A extends boolean, D>(
  key: K,
  defaultValue: D,
  isArray: A,
  codec: Codec<E>,
  kind: ArrayKind<E> = { isSet: false }
): QueryParam<ParamValue<E, A> | D, K> => {
  const { parse, serialize } = isArray ? createArrayCodec(codec, kind) : codec;
  // a set is equal to another of the same values in any order
  const toParam = (value: E | E[]) =>
    Array.isArray(value)
      ? (kind.isSet ? value.map(codec.serialize).sort() : value.map(codec.serialize)).join(',')
      : codec.serialize(value);
  return {
    key,
    defaultValue,
    isArray,
    parse,
    serialize,
    isEqual: (a: E | E[], b: E | E[]) => toParam(a) === toParam(b)
  } as QueryParam<ParamValue<E, A> | D, K>;
};

/** A switch: `1` / `0` */
export const createBoolParam = <K extends string>(key: K, defaultValue = false): QueryParam<boolean, K> =>
  createParam(key, defaultValue, false, {
    parse: value => (value === '1' ? true : value === '0' ? false : undefined),
    serialize: value => (value ? '1' : '0')
  });

export type NumParamOptions<A extends boolean> = { min?: number; max?: number } & ArrayOption<A>;

/** A finite number, within the range of the options */
export const createNumParam = <
  K extends string,
  A extends boolean = false,
  D extends ParamValue<number, A> | null = null
>(
  key: K,
  defaultValue: D = null as D,
  { min = -Infinity, max = Infinity, isArray = false as A }: NumParamOptions<A> = {}
) =>
  createParam<number, K, A, D>(key, defaultValue, isArray, {
    parse: value => {
      const number = Number(value);
      return value.trim() && Number.isFinite(number) && number >= min && number <= max ? number : undefined;
    },
    serialize: String
  });

export type StringParamOptions<A extends boolean> = { pattern?: string } & ArrayOption<A>;

/** A string, matching the whole of the pattern (a regular expression) of the options */
export const createStringParam = <
  K extends string,
  A extends boolean = false,
  D extends ParamValue<string, A> | null = null
>(
  key: K,
  defaultValue: D = null as D,
  { pattern, isArray = false as A }: StringParamOptions<A> = {}
) => {
  const regExp = pattern === undefined ? null : new RegExp(`^(?:${pattern})$`);
  return createParam<string, K, A, D>(key, defaultValue, isArray, {
    parse: value => (regExp === null || regExp.test(value) ? value : undefined),
    serialize: value => value
  });
};

const isValueList = <T extends string>(values: readonly T[] | Record<T, string>): values is readonly T[] =>
  Array.isArray(values);

/**
 * One of the values: of a list, each its own param (e.g. `['max', 'name']`), or of a map to their params (e.g.
 * `{ moonlessNight: 'man', astroNight: 'an' }`). With `isArray` a set of them, which may be given relative to its
 * default (see `createArrayCodec`).
 */
export const createEnumParam = <
  T extends string,
  K extends string,
  A extends boolean = false,
  D extends ParamValue<T, A> | null = null
>(
  key: K,
  values: readonly T[] | Record<T, string>,
  defaultValue: D = null as D,
  { isArray = false as A }: ArrayOption<A> = {}
) => {
  const valueMap = isValueList(values)
    ? (Object.fromEntries(values.map(value => [value, value as string])) as Record<T, string>)
    : values;
  const keys = Object.keys(valueMap) as T[];
  return createParam<T, K, A, D>(
    key,
    defaultValue,
    isArray,
    { parse: param => keys.find(value => valueMap[value] === param), serialize: value => valueMap[value] },
    // a list of enum values is a set, which may be given relative to its default
    { isSet: true, relativeTo: Array.isArray(defaultValue) ? (defaultValue as T[]) : null }
  );
};

export type DateParamOptions<A extends boolean> = { format?: string } & ArrayOption<A>;

/** A day in the format of the options (`YYYY-MM-DD` by default), as a `Date` at its local midnight */
export const createDateParam = <
  K extends string,
  A extends boolean = false,
  D extends ParamValue<Date, A> | null = null
>(
  key: K,
  defaultValue: D = null as D,
  { format = 'YYYY-MM-DD', isArray = false as A }: DateParamOptions<A> = {}
) =>
  createParam<Date, K, A, D>(key, defaultValue, isArray, {
    parse: value => {
      const date = moment(value, format, true);
      return date.isValid() ? date.toDate() : undefined;
    },
    serialize: value => moment(value).format(format)
  });

const isDefault = <T>(param: QueryParam<T>, value: T) =>
  value === null ||
  (param.defaultValue !== null && param.isEqual(value as NonNullable<T>, param.defaultValue as NonNullable<T>));

/** The value of the param in the query; the fallback (its default by default) when it is missing or unknown */
export const readParam = <T>(query: Query, param: QueryParam<T>, fallback: T = param.defaultValue): T => {
  const value = query[param.key];
  if (value === undefined) return fallback;
  const parsed = param.parse(value);
  return parsed === undefined ? fallback : parsed;
};

/** The values of a record of params in the query, by their names */
export const readParams = <P extends Record<string, QueryParam<unknown>>>(query: Query, params: P) =>
  Object.fromEntries(Object.entries(params).map(([name, param]) => [name, readParam(query, param)])) as ParamValues<P>;

/** The query of the param: empty at its default */
export const paramToQuery = <T>(param: QueryParam<T>, value: T): Query =>
  isDefault(param, value) ? {} : { [param.key]: param.serialize(value as NonNullable<T>) };

/** The query with the value of the param, in its place when it was there already; left out at its default */
export const writeParam = <T>(query: Query, param: QueryParam<T>, value: T): Query => {
  const update = paramToQuery(param, value);
  if (!(param.key in update)) return Object.fromEntries(Object.entries(query).filter(([key]) => key !== param.key));
  return param.key in query ? { ...query, [param.key]: update[param.key] } : { ...query, ...update };
};

/** The query has a known value of one of the params at least (unknown params and values are read as missing) */
export const hasKnownParam = (query: Query, params: readonly QueryParam<unknown>[]) =>
  params.some(({ key, parse }) => query[key] !== undefined && parse(query[key]) !== undefined);
