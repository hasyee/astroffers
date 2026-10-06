import { useEffect } from 'react';
import { useQuerySelector } from '../router/router.hooks';
import { serializeQuery } from '../router/router.utils';
import { writeStored } from '../storage/storage.utils';
import { STORED_PARAMS } from './query.utils';

/** Stores the params of the query but the date in `localStorage`, to restore them on the next start (`restoreQuery`) */
export const useQueryStorage = () => {
  const stored = useQuerySelector(query =>
    serializeQuery(
      Object.fromEntries(STORED_PARAMS.filter(({ key }) => key in query).map(({ key }) => [key, query[key]]))
    )
  );
  useEffect(() => writeStored('query', stored), [stored]);
};
