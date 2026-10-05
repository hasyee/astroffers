import { useEffect } from 'react';
import { useFilter } from '../filter/filter.hooks';
import { useListImages, useSearch, useSortBy } from '../list/list.hooks';

/**
 * Stores the filter, the order, the search and the images of the table of the query in `localStorage`, to complete
 * the query on start
 */
export default function QueryStorage() {
  const sortBy = useSortBy();
  const search = useSearch();
  const [hasImages] = useListImages();
  const filter = useFilter();

  useEffect(() => {
    localStorage.setItem('sortBy', sortBy);
  }, [sortBy]);
  useEffect(() => {
    localStorage.setItem('search', JSON.stringify(search));
  }, [search]);
  useEffect(() => {
    localStorage.setItem('images', String(hasImages));
  }, [hasImages]);
  useEffect(() => {
    localStorage.setItem('filter', JSON.stringify(filter));
  }, [filter]);

  return null;
}
