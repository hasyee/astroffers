import { Children, isValidElement, useContext, type ReactNode } from 'react';
import { RouteContext, usePathname } from './router.hooks';
import type { RouteProps } from './router.route';
import type { Params } from './router.types';
import { joinPath, matchPath } from './router.utils';

const noParams: Params = {};

/** Renders the first `Route` child matching the path, relative to the parent `Route` unless absolute (from tinc) */
export default function Routes({ children }: { children?: ReactNode }) {
  const pathname = usePathname();
  const parentMatch = useContext(RouteContext);

  const baseRemainder = parentMatch ? parentMatch.remainder : pathname.slice(1);
  const baseMatchedPrefix = parentMatch ? parentMatch.matchedPrefix : '';
  const baseParams = parentMatch ? parentMatch.params : noParams;

  for (const child of Children.toArray(children)) {
    if (!isValidElement(child)) continue;
    const { path } = child.props as RouteProps;
    if (typeof path !== 'string') continue;

    const isAbsolute = path.startsWith('/');
    const candidate = isAbsolute ? pathname : baseRemainder;
    const match = matchPath(path, candidate);
    if (!match) continue;

    const matchedPrefix = isAbsolute
      ? joinPath('', match.matchedSegment)
      : joinPath(baseMatchedPrefix, match.matchedSegment);

    return (
      <RouteContext.Provider
        value={{ matchedPrefix, remainder: match.remainder, params: { ...baseParams, ...match.params } }}
      >
        {child}
      </RouteContext.Provider>
    );
  }

  return null;
}
