import { createContext, useCallback, useContext, useMemo } from 'react';
import { createStateContext, useStateSelector, useStateSetter, useStateValue } from '../provider/state.hooks';
import type {
  BreadcrumbName,
  HistoryState,
  NavigateQuery,
  NavigateStep,
  Params,
  Query,
  RouteMatch,
  RouterLocation
} from './router.types';
import { joinPath, matchPath, parseQuery, pickQuery, popSegments, serializeQuery } from './router.utils';

// `RouterLocation` / `usePathname` instead of tinc's `Location` / `useLocation`, not to mix them up with the
// geographic location of the app (`location/`)
export const RouterLocationContext = createStateContext<RouterLocation>({ pathname: '/', search: '' });
export const RouteNameContext = createStateContext<BreadcrumbName[]>([]);
/** Match of the closest `Route` rendered by `Routes` */
export const RouteContext = createContext<RouteMatch | null>(null);
/**
 * A sticky query holds the state of the app rather than a part of the history: navigating without a query keeps
 * it, and the back / forward buttons change the path only (see `RouterProvider`)
 */
export const RouterOptionsContext = createContext<{ isQuerySticky: boolean }>({ isQuerySticky: false });

const noParams: Params = {};

export function useRouteNameRegistrar() {
  const setter = useStateSetter(RouteNameContext);
  return useCallback(
    (item: BreadcrumbName, operation: 1 | -1 = 1) => {
      if (operation === 1) {
        return setter(items =>
          [item, ...items].sort((a, b) => {
            if (a.to === b.to) return 0;
            if (a.to.includes(b.to)) return 1;
            if (b.to.includes(a.to)) return -1;
            return 0;
          })
        );
      }
      return setter(items => items.filter(existing => existing.to !== item.to));
    },
    [setter]
  );
}

/** Params of the closest `Route` and its ancestors */
export function useParams(): Params {
  const match = useContext(RouteContext);
  return match ? match.params : noParams;
}

/** Names of the matched routes from the root, e.g. for a breadcrumb or the title of the page */
export function useBreadcrumbNames(): BreadcrumbName[] {
  return useStateValue(RouteNameContext);
}

export function usePathname(): string {
  return useStateSelector(RouterLocationContext, location => location.pathname);
}

export function useMatch(): RouteMatch | null {
  return useContext(RouteContext);
}

/** Params of the pattern (e.g. `object/:ngc`) when it matches the current path, otherwise null */
export function useMatchPath(pattern: string): Params | null {
  // the selector has to return a stable value, so the path is selected and matched outside of it
  const pathname = usePathname();
  return useMemo(() => matchPath(pattern, pathname)?.params ?? null, [pattern, pathname]);
}

export function useQuery(): Query {
  const search = useStateSelector(RouterLocationContext, location => location.search);
  return useMemo(() => parseQuery(search), [search]);
}

/** A value selected from the query; the selector has to return a primitive (or another stable value) */
export function useQuerySelector<S>(selector: (query: Query) => S): S {
  return useStateSelector(RouterLocationContext, location => selector(parseQuery(location.search)));
}

/** A value parsed from the given params of the query, parsed again only when one of them changes */
export function useQueryParams<T>(keys: readonly string[], parse: (query: Query) => T): T {
  const params = useStateSelector(RouterLocationContext, location => pickQuery(location.search, keys));
  return useMemo(() => parse(parseQuery(params)), [params, parse]);
}

/**
 * Updates the query of the current path, replacing the history entry: the query as a state of the app, e.g. a
 * filter, which should not add an entry to the history with every change
 */
export function useQuerySetter() {
  const setLocation = useStateSetter(RouterLocationContext);

  return useCallback(
    (update: (query: Query) => Query) => {
      const search = serializeQuery(update(parseQuery(window.location.search)));
      if (search === window.location.search) return;
      const { pathname } = window.location;
      window.history.replaceState(window.history.state, '', pathname + search);
      setLocation({ pathname, search });
    },
    [setLocation]
  );
}

/**
 * Pushes a history entry by default; `replace` swaps the current one instead, e.g. to step between the objects of
 * the details without a history entry for each. Without a query the current one is kept when it is sticky.
 */
export function useNavigate({ replace = false }: { replace?: boolean } = {}) {
  const setLocation = useStateSetter(RouterLocationContext);
  const match = useContext(RouteContext);
  const { isQuerySticky } = useContext(RouterOptionsContext);

  return useCallback(
    (...args: [...NavigateStep[], NavigateQuery] | NavigateStep[]) => {
      const last = args[args.length - 1];
      const hasQuery = typeof last === 'object' || typeof last === 'function';
      const steps = (hasQuery ? args.slice(0, -1) : args) as NavigateStep[];
      const query = hasQuery ? (last as NavigateQuery) : undefined;

      // Steps are applied sequentially, each against the result of the previous one: a negative
      // number pops that many trailing path segments (e.g. navigate(-1) -> parent path, not browser
      // history - history.back() can land anywhere depending on how the user arrived here), a relative
      // string appends a segment, an absolute string ('/...') replaces the path outright.
      let pathname = match ? match.matchedPrefix : '';
      for (const step of steps) {
        pathname =
          typeof step === 'number'
            ? popSegments(pathname, -step)
            : step.startsWith('/')
              ? step
              : joinPath(pathname, step);
      }

      const currentQuery = parseQuery(window.location.search);
      const resolvedQuery =
        typeof query === 'function' ? query(currentQuery) : (query ?? (isQuerySticky ? currentQuery : {}));
      const search = serializeQuery(resolvedQuery);
      if (pathname + search === window.location.pathname + window.location.search) return;
      if (replace) window.history.replaceState(window.history.state, '', pathname + search);
      else window.history.pushState({ isInApp: true } satisfies HistoryState, '', pathname + search);
      setLocation({ pathname, search });
    },
    [replace, setLocation, match, isQuerySticky]
  );
}

export function useLocationId(name: string): string | null {
  return useParams()[name] ?? null;
}

/**
 * Leaves a route opened over the main view (e.g. a dialog): steps back in the history when the route was opened
 * in the app, so the back button of the phone does not open it again; otherwise (opened by a link or a bookmark)
 * replaces it with the fallback path, not to leave the app.
 */
export function useGoBack(fallback = '/') {
  const navigate = useNavigate({ replace: true });

  return useCallback(() => {
    if ((window.history.state as HistoryState)?.isInApp) window.history.back();
    else navigate(fallback);
  }, [navigate, fallback]);
}

/** Steps to the parent path when the deleted document (by the result of a mutation) is the one in the path */
export const useRedirectionAfterDelete = (field: string = '_id') => {
  const navigate = useNavigate();
  const pathname = usePathname();

  return useCallback(
    (result: any) => {
      const pathParts = pathname.split('/').filter(Boolean);
      const lastPart = pathParts.at(-1);
      if (
        (Array.isArray(result) &&
          result.some(result => result && typeof result[field] === 'string' && lastPart === result[field])) ||
        (result && typeof result[field] === 'string' && lastPart === result[field])
      ) {
        navigate(-1);
      }
    },
    [field, pathname, navigate]
  );
};

/** Steps to the parent path when the deleted document (by the arguments of a mutation) is the one in the path */
export const useRedirectionAfterDeleteByArgs = (field: string = '_ids') => {
  const navigate = useNavigate();
  const pathname = usePathname();

  return useCallback(
    (_: any, args: any) => {
      const pathParts = pathname.split('/').filter(Boolean);
      const lastPart = pathParts.at(-1);
      if (
        (Array.isArray(args[field]) && args[field].some((id: string) => typeof id === 'string' && lastPart === id)) ||
        (args[field] && typeof args[field] === 'string' && lastPart === args[field])
      ) {
        navigate(-1);
      }
    },
    [field, pathname, navigate]
  );
};
