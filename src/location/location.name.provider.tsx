import { type PropsWithChildren, useState } from 'react';
import StateProvider from '../provider/state.provider';
import { readStored, writeStored } from '../storage/storage.utils';
import { LocationNameContext } from './location.hooks';

const storeName = (name: string) => writeStored('locationName', name);

/** The name of the place, stored in `localStorage` */
export default function LocationNameProvider({ children }: PropsWithChildren<{}>) {
  const [initialName] = useState(() => readStored('locationName'));
  return (
    <StateProvider context={LocationNameContext} initialState={initialName} onChange={storeName}>
      {children}
    </StateProvider>
  );
}
