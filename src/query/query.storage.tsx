import { useEffect } from 'react';
import { useCalendarOpen } from '../calendar/calendar.hooks';
import { useFilter } from '../filter/filter.hooks';
import { useListImages, useSearch, useSortBy } from '../list/list.hooks';

/**
 * Stores the state of the query but the date (the filter, the order, the search, the images of the table and the
 * open calendar) in `localStorage`, to complete the query on start
 */
export default function QueryStorage() {
  const sortBy = useSortBy();
  const search = useSearch();
  const [hasImages] = useListImages();
  const [isCalendarOpen] = useCalendarOpen();
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
    localStorage.setItem('calendar', String(isCalendarOpen));
  }, [isCalendarOpen]);
  useEffect(() => {
    localStorage.setItem('filter', JSON.stringify(filter));
  }, [filter]);

  return null;
}
