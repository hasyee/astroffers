import { type PropsWithChildren } from 'react';
import StateProvider from '../provider/state.provider';
import { SearchContext } from './list.hooks';

/** The search of the list; its order is in the query (`list.hooks.ts`) */
export default function ListProvider({ children }: PropsWithChildren<{}>) {
  return <StateProvider context={SearchContext}>{children}</StateProvider>;
}
