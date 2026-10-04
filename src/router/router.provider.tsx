import { type PropsWithChildren, useEffect, useMemo, useRef } from 'react';
import { useStateSetter, useStateValue } from '../provider/state.hooks';
import StateProvider from '../provider/state.provider';
import { RouteNameContext, RouterLocationContext, RouterOptionsContext } from './router.hooks';

type Props = PropsWithChildren<{
  /** The query holds the state of the app: kept by navigating without a query and by the back / forward buttons */
  isQuerySticky?: boolean;
}>;

/** Keeps the path of the browser in a state, updated by `useNavigate` and the back / forward buttons (from tinc) */
export default function RouterProvider({ isQuerySticky = false, children }: Props) {
  const initialState = useMemo(() => ({ pathname: window.location.pathname, search: window.location.search }), []);
  const options = useMemo(() => ({ isQuerySticky }), [isQuerySticky]);

  return (
    <RouterOptionsContext.Provider value={options}>
      <StateProvider context={RouterLocationContext} initialState={initialState}>
        <StateProvider context={RouteNameContext}>
          <LocationListener isQuerySticky={isQuerySticky}>{children}</LocationListener>
        </StateProvider>
      </StateProvider>
    </RouterOptionsContext.Provider>
  );
}

function LocationListener({ isQuerySticky, children }: PropsWithChildren<{ isQuerySticky: boolean }>) {
  const location = useStateValue(RouterLocationContext);
  const setLocation = useStateSetter(RouterLocationContext);
  const searchRef = useRef(location.search);
  searchRef.current = location.search;

  useEffect(() => {
    const handlePopState = () => {
      const { pathname, search } = window.location;
      // a sticky query is carried over to the entry stepped to, e.g. a filter changed while a drawer was open
      if (isQuerySticky && search !== searchRef.current) {
        window.history.replaceState(window.history.state, '', pathname + searchRef.current);
        setLocation({ pathname, search: searchRef.current });
      } else {
        setLocation({ pathname, search });
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isQuerySticky, setLocation]);

  return <>{children}</>;
}
