import { type PropsWithChildren } from 'react';
import StateProvider from '../provider/state.provider';
import { DetailsContext } from './details.hooks';

export default function DetailsProvider({ children }: PropsWithChildren<{}>) {
  return <StateProvider context={DetailsContext}>{children}</StateProvider>;
}
