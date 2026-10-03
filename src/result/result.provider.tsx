import { type PropsWithChildren } from 'react';
import StateProvider from '../provider/state.provider';
import { ResultContext } from './result.hooks';

export default function ResultProvider({ children }: PropsWithChildren<{}>) {
  return <StateProvider context={ResultContext}>{children}</StateProvider>;
}
