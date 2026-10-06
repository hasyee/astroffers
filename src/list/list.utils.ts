import type { NgcInfo } from '../calculator/calculator.types';
import type { ParamValidators, Query } from '../router/router.types';
import type { ListSearch, SortBy } from './list.types';

type Selector = (ngcInfo: NgcInfo) => number | string | null | undefined;

/** The order of the catalog: by NGC number, the Messier objects without one at the end by their Messier number */
/** By the NGC number, then the Messier number; the bodies of the Solar System, having neither, at the end */
const byCatalog = ({ object: a }: NgcInfo, { object: b }: NgcInfo) =>
  a.ngc !== undefined && b.ngc !== undefined
    ? a.ngc - b.ngc
    : a.ngc !== undefined
      ? -1
      : b.ngc !== undefined
        ? +1
        : (a.messier ?? Number.MAX_SAFE_INTEGER) - (b.messier ?? Number.MAX_SAFE_INTEGER);

/** Ascending order; objects missing the value go to the end, in the order of the catalog */
const by =
  (select: Selector) =>
  (a: NgcInfo, b: NgcInfo): number => {
    const aValue = select(a);
    const bValue = select(b);
    const aMissing = aValue === undefined || aValue === null;
    const bMissing = bValue === undefined || bValue === null;
    if (aMissing && bMissing) return byCatalog(a, b);
    if (aMissing) return +1;
    if (bMissing) return -1;
    if (aValue < bValue) return -1;
    if (aValue > bValue) return +1;
    return 0;
  };

export const sorters: Record<SortBy, (a: NgcInfo, b: NgcInfo) => number> = {
  ngc: by(({ object }) => object.ngc),
  messier: by(({ object }) => object.messier),
  name: by(({ object }) => object.name),
  type: by(({ object }) => object.types[0]),
  constellation: by(({ object }) => object.constellation),
  from: by(({ intersection }) => intersection.start),
  to: by(({ intersection }) => intersection.end),
  max: (a, b) => (a.max ?? 0) - (b.max ?? 0) || a.sum - b.sum,
  sum: by(({ sum }) => sum),
  magnitude: by(({ object }) => object.magnitude),
  surfaceBrightness: by(({ object }) => object.surfaceBrightness)
};

export const sortOptions: { value: SortBy; label: string }[] = [
  { value: 'max', label: 'Best visibility' },
  { value: 'ngc', label: 'NGC' },
  { value: 'messier', label: 'Messier' },
  { value: 'name', label: 'Name' },
  { value: 'type', label: 'Type' },
  { value: 'constellation', label: 'Constellation' },
  { value: 'from', label: 'Visible from' },
  { value: 'to', label: 'Visible to' },
  { value: 'sum', label: 'Visibility length' },
  { value: 'magnitude', label: 'Magnitude' },
  { value: 'surfaceBrightness', label: 'Surface brightness' }
];

export const defaultSortBy: SortBy = 'max';

const isSortBy = (value: string | null | undefined): value is SortBy => !!value && Object.hasOwn(sorters, value);

export const parseStoredSortBy = (value: string | null): SortBy => (isSortBy(value) ? value : defaultSortBy);

/** Query param of the order of the list: `sort`, left out at the default order */
export const SORT_PARAMS = ['sort'] as const;

export const sortParamValidators: ParamValidators<(typeof SORT_PARAMS)[number]> = { sort: isSortBy };

export const sortByFromQuery = (query: Query, fallback: SortBy): SortBy =>
  isSortBy(query.sort) ? query.sort : fallback;

export const sortByToQuery = (sortBy: SortBy): Query => (sortBy === defaultSortBy ? {} : { sort: sortBy });

/** Query param of the images of the table: `img=0` for the compact table without them, left out with them (the default) */
export const IMAGES_PARAMS = ['img'] as const;

export const imagesParamValidators: ParamValidators<(typeof IMAGES_PARAMS)[number]> = {
  img: value => value === '1' || value === '0'
};

export const imagesFromQuery = (query: Query, fallback: boolean): boolean =>
  'img' in query ? query.img !== '0' : fallback;

export const imagesToQuery = (hasImages: boolean): Query => (hasImages ? {} : { img: '0' });

/** Shown unless turned off (nothing stored yet too) */
export const parseStoredImages = (value: string | null) => value !== 'false';

export const emptySearch: ListSearch = { ngc: '', messier: '', name: '' };

/** Query params of the search of the list: `ngc`, `messier`, `name`, each left out when empty */
export const SEARCH_PARAMS = ['ngc', 'messier', 'name'] as const;

const isTerm = (value: string) => value !== '';

export const searchParamValidators: ParamValidators<(typeof SEARCH_PARAMS)[number]> = {
  ngc: isTerm,
  messier: isTerm,
  name: isTerm
};

/** The search from the query; the fallback when none of its params is there */
export const searchFromQuery = (query: Query, fallback: ListSearch): ListSearch =>
  SEARCH_PARAMS.some(key => key in query)
    ? { ngc: query.ngc ?? '', messier: query.messier ?? '', name: query.name ?? '' }
    : fallback;

export const searchToQuery = (search: ListSearch): Query =>
  Object.fromEntries(SEARCH_PARAMS.filter(key => search[key]).map(key => [key, search[key]]));

/** Restores the search from its stored JSON; empty for anything malformed */
export const parseStoredSearch = (json: string | null): ListSearch => {
  try {
    const stored = JSON.parse(json ?? 'null');
    return Object.fromEntries(
      SEARCH_PARAMS.map(key => [key, typeof stored?.[key] === 'string' ? stored[key] : ''])
    ) as ListSearch;
  } catch (error) {
    console.error(error);
    return emptySearch;
  }
};

export const isSearchEmpty = (search: ListSearch) => !search.ngc && !search.messier && !search.name;

/** Search term matching every object that has the field at all (toggled by `SearchAnyAdornment`) */
export const SEARCH_ANY = '*';

const matchesMessier = (term: string, messier: number | undefined) =>
  !term || (term === SEARCH_ANY ? messier !== undefined : String(messier) === term);

const matchesName = (term: string, name: string | undefined) =>
  !term || (term === SEARCH_ANY ? !!name : !!name?.toLowerCase().includes(term.toLowerCase()));

export const matchesSearch =
  ({ ngc, messier, name }: ListSearch) =>
  ({ object }: NgcInfo) =>
    (!ngc.trim() || String(object.ngc) === ngc.trim()) &&
    matchesMessier(messier.trim(), object.messier) &&
    matchesName(name.trim(), object.name);
