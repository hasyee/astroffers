import { type PropsWithChildren, useMemo } from 'react';
import StateProvider from '../provider/state.provider';
import { DateContext } from './date.hooks';
import { getToday } from './date.utils';

export default function DateProvider({ children }: PropsWithChildren<{}>) {
  // the night of today by default, even when the app has been kept open since an earlier day
  const initialState = useMemo(() => getToday(), []);

  return (
    <StateProvider context={DateContext} initialState={initialState}>
      {children}
    </StateProvider>
  );
}
