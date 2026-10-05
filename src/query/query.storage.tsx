import { useEffect } from 'react';
import { useFilter } from '../filter/filter.hooks';
import { useSearch, useSortBy } from '../list/list.hooks';

/** Stores the filter, the order and the search of the query in `localStorage`, to complete the query on start */
export default function QueryStorage() {
  const sortBy = useSortBy();
  const search = useSearch();
  const filter = useFilter();

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);
  useEffect(() => {
    localStorage.setItem('search', JSON.stringify(search));
  }, [search]);
  useEffect(() => {
    localStorage.setItem('filter', JSON.stringify(filter));
  }, [filter]);

  return null;
}
