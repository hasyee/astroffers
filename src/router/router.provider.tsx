import { type PropsWithChildren, useEffect, useMemo } from 'react';
import { useStateSetter } from '../provider/state.hooks';
import StateProvider from '../provider/state.provider';
import { RouteNameContext, RouterLocationContext } from './router.hooks';

/** Keeps the path of the browser in a state, updated by `useNavigate` and the back / forward buttons (from tinc) */
export default function RouterProvider({ children }: PropsWithChildren<{}>) {
  const initialState = useMemo(() => ({ pathname: window.location.pathname, search: window.location.search }), []);

  return (
    <StateProvider context={RouterLocationContext} initialState={initialState}>
      <StateProvider context={RouteNameContext}>
        <LocationListener>{children}</LocationListener>
      </StateProvider>
    </StateProvider>
  );
}

function LocationListener({ children }: PropsWithChildren<{}>) {
  const setLocation = useStateSetter(RouterLocationContext);

  useEffect(() => {
    const handlePopState = () => setLocation({ pathname: window.location.pathname, search: window.location.search });
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [setLocation]);

  return <>{children}</>;
}
