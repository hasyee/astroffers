import type { NgcInfo } from '../calculator/calculator.types';
import type { Query } from '../router/router.types';
import type { ListSearch, SortBy } from './list.types';

type Selector = (ngcInfo: NgcInfo) => number | string | null | undefined;

/** Ascending order; objects missing the value go to the end, in NGC order */
const by =
  (select: Selector) =>
  (a: NgcInfo, b: NgcInfo): number => {
    const aValue = select(a);
    const bValue = select(b);
    const aMissing = aValue === undefined || aValue === null;
    const bMissing = bValue === undefined || bValue === null;
    if (aMissing && bMissing) return a.object.ngc - b.object.ngc;
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

/** Query param of the order of the list: `sort` */
export const SORT_PARAMS = ['sort'] as const;

export const sortByFromQuery = (query: Query, fallback: SortBy): SortBy =>
  isSortBy(query.sort) ? query.sort : fallback;

export const sortByToQuery = (sortBy: SortBy): Query => ({ sort: sortBy });

export const emptySearch: ListSearch = { ngc: '', messier: '', name: '' };

export const isSearchEmpty = (search: ListSearch) => !search.ngc && !search.messier && !search.name;

/** Search term matching every object that has the field at all */
const ANY = '*';

const matchesMessier = (term: string, messier: number | undefined) =>
  !term || (term === ANY ? messier !== undefined : String(messier) === term);

const matchesName = (term: string, name: string | undefined) =>
  !term || (term === ANY ? !!name : !!name?.toLowerCase().includes(term.toLowerCase()));

export const matchesSearch =
  ({ ngc, messier, name }: ListSearch) =>
  ({ object }: NgcInfo) =>
    (!ngc.trim() || String(object.ngc) === ngc.trim()) &&
    matchesMessier(messier.trim(), object.messier) &&
    matchesName(name.trim(), object.name);
