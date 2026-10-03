import { type Context, createContext, useContextSelector } from './context.selector';
import type { State } from './state.types';
import { defaultSetState } from './state.utils';

export function createStateContext<T>(defaultState: T) {
  return createContext<[T, State.Setter<T>]>([defaultState, defaultSetState]);
}
export function useStateValue<T>(context: Context<[T, State.Setter<T>]>) {
  return useContextSelector(context, ([data]) => data);
}
export function useStateSelector<T, S>(context: Context<[T, State.Setter<T>]>, selector: State.Selector<T, S>) {
  return useContextSelector(context, ([data]) => selector(data));
}
export function useStateSetter<T>(context: Context<[T, State.Setter<T>]>) {
  return useContextSelector(context, ([, fetch]) => fetch);
}
