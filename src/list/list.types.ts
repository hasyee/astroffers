export type SortBy =
  | 'ngc'
  | 'messier'
  | 'name'
  | 'type'
  | 'constellation'
  | 'from'
  | 'to'
  | 'max'
  | 'sum'
  | 'magnitude'
  | 'surfaceBrightness';

/** Search terms of the result list */
export type ListSearch = { ngc: string; messier: string; name: string };
