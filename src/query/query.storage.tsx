import { useEffect } from 'react';
import { useCalendarOpen } from '../calendar/calendar.hooks';
import { useFilter } from '../filter/filter.hooks';
import { useListImages, useSearch, useSortBy } from '../list/list.hooks';
import { useRedLight } from '../redlight/redlight.hooks';
import { writeStored } from '../storage/storage.utils';

/**
 * Stores the state of the query but the date (the filter, the order, the search, the images of the table and the
 * open calendar, the red light mode) in `localStorage`, to complete the query on start
 */
export default function QueryStorage() {
  const sortBy = useSortBy();
  const search = useSearch();
  const [hasImages] = useListImages();
  const [isCalendarOpen] = useCalendarOpen();
  const [isRedLight] = useRedLight();
  const filter = useFilter();

  useEffect(() => {
    writeStored('sortBy', sortBy);
  }, [sortBy]);
  useEffect(() => {
    writeStored('search', search);
  }, [search]);
  useEffect(() => {
    writeStored('images', hasImages);
  }, [hasImages]);
  useEffect(() => {
    writeStored('calendar', isCalendarOpen);
  }, [isCalendarOpen]);
  useEffect(() => {
    writeStored('redLight', isRedLight);
  }, [isRedLight]);
  useEffect(() => {
    writeStored('filter', filter);
  }, [filter]);

  return null;
}
