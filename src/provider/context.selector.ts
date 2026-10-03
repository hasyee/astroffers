import {
  createContext as createReactContext,
  createElement,
  useContext as useReactContext,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
  type PropsWithChildren,
  type ReactElement,
  type Context as ReactContextType
} from 'react';

type Listener = () => void;

type Store<T> = {
  getValue: () => T;
  subscribe: (listener: Listener) => () => void;
};

const UNSET = Symbol('unset');

export type Context<T> = {
  Provider: (props: PropsWithChildren<{ value: T }>) => ReactElement;
  defaultValue: T;
  storeContext: ReactContextType<Store<T> | typeof UNSET>;
};

export function createContext<T>(defaultValue: T): Context<T> {
  const storeContext = createReactContext<Store<T> | typeof UNSET>(UNSET);

  function Provider({ value, children }: PropsWithChildren<{ value: T }>) {
    const stateRef = useRef<{ value: T; listeners: Set<Listener> }>(undefined);
    if (!stateRef.current) stateRef.current = { value, listeners: new Set() };
    // Written synchronously during render (not in an effect): a component that mounts
    // fresh in this same commit will always see the current value, never a stale one
    // from a previous commit.
    stateRef.current.value = value;

    const storeRef = useRef<Store<T>>(undefined);
    if (!storeRef.current) {
      storeRef.current = {
        getValue: () => stateRef.current!.value,
        subscribe: listener => {
          stateRef.current!.listeners.add(listener);
          return () => stateRef.current!.listeners.delete(listener);
        }
      };
    }

    useLayoutEffect(() => {
      stateRef.current!.listeners.forEach(listener => listener());
    });

    return createElement(storeContext.Provider, { value: storeRef.current }, children);
  }

  return { Provider, defaultValue, storeContext };
}

export function useContextSelector<T, S>(context: Context<T>, selector: (value: T) => S): S {
  const store = useReactContext(context.storeContext);
  return useSyncExternalStore(
    onStoreChange => (store === UNSET ? () => {} : store.subscribe(onStoreChange)),
    () => selector(store === UNSET ? context.defaultValue : store.getValue())
  );
}

export function useContext<T>(context: Context<T>): T {
  return useContextSelector(context, value => value);
}
