import type { NgcInfo } from '../calculator/calculator.types';
import { createBoolParam, createEnumParam, createStringParam } from '../query/query.params';
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
  max: (a, b) => by(({ max }) => max)(a, b) || a.sum - b.sum,
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

/** Query param of the order of the list: `sort` (the key of the sorter), left out at the default order */
export const SORT_PARAM = createEnumParam('sort', Object.keys(sorters) as SortBy[], defaultSortBy);

/** Query param of the images of the table: `img=0` for the compact table without them, left out with them (the default) */
export const IMAGES_PARAM = createBoolParam('img', true);

export const emptySearch: ListSearch = { ngc: '', messier: '', name: '' };

/** Query params of the search of the list: `ngc`, `messier`, `name`, each left out when empty (an empty one unknown) */
export const SEARCH_PARAMS = {
  ngc: createStringParam('ngc', '', { pattern: '.+' }),
  messier: createStringParam('messier', '', { pattern: '.+' }),
  name: createStringParam('name', '', { pattern: '.+' })
} satisfies Record<keyof ListSearch, unknown>;

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
