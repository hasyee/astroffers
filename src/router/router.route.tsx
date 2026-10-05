import { useContext, useLayoutEffect, useMemo, type ReactNode } from 'react';
import { RouteContext, useRouteNameRegistrar } from './router.hooks';
import type { Params } from './router.types';

export type RouteProps = {
  /** Pattern like `:ngc`, `deleted/:collection?` or `items/*`, matched by the parent `Routes` */
  path: string;
  /** Name of the route among the breadcrumb names (`useBreadcrumbNames`) */
  name?: string | ((params: Params) => string);
  children?: ReactNode;
};

/** A route of `Routes`; its children are rendered when its path matches (from tinc) */
export default function Route({ name, children }: RouteProps) {
  const match = useContext(RouteContext);
  const registerName = useRouteNameRegistrar();

  const breadcrumbItem = useMemo(() => {
    if (name === undefined || !match) return null;
    return { name: typeof name === 'function' ? name(match.params) : name, to: match.matchedPrefix };
  }, [name, match]);

  useLayoutEffect(() => {
    if (!breadcrumbItem) return;
    registerName(breadcrumbItem);
    return () => registerName(breadcrumbItem, -1);
  }, [registerName, breadcrumbItem]);

  return <>{children}</>;
}
