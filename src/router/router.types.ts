export type Params = Record<string, string>;

export type Query = Record<string, string>;

export type RouterLocation = { pathname: string; search: string };

export type RouteMatch = {
  matchedPrefix: string; // absolute path matched so far, e.g. "/m27" (root value is "/")
  remainder: string; // unmatched remainder, no leading slash, "" once fully consumed
  params: Params; // merged captures from this Route + all ancestors
};

export type BreadcrumbName = { name: string; to: string };

export type NavigateStep = string | number;
export type NavigateQuery = Query | ((currentQuery: Query) => Query);

/**
 * State of the history entries pushed by the app: how many of them lead to the entry (0 or missing for the first
 * page of the app, e.g. a link); a replaced entry keeps it
 */
export type HistoryState = { depth?: number } | null;
