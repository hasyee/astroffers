import { type PropsWithChildren, useEffect, useState } from 'react';
import { type Context, useContext } from './context.selector';
import type { State } from './state.types';

export default function StateProvider<T>({
  context,
  children,
  initialState,
  onChange
}: PropsWithChildren<{ context: Context<[T, State.Setter<T>]>; initialState?: T; onChange?: State.Change<T> }>) {
  const [defaultState] = useContext(context);
  const [state, setState] = useState(initialState ?? defaultState);

  useEffect(() => onChange?.(state), [state, onChange]);

  return <context.Provider value={[state, setState]}>{children}</context.Provider>;
}
