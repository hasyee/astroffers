import { useCallback, useEffect, useMemo, useState } from 'react';
import moment from 'moment';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { CalendarDay, Timestamp } from '../calculator/calculator.types';
import { useDate } from '../date/date.hooks';
import { useCloseOnBack } from '../history/history.hooks';
import { useSwipe } from '../swipe/swipe.hooks';
import { useCalendarMonths } from './calendar.hooks';
import CalendarItem from './calendar.item';
import './calendar.scss';

const getThisMonth = () => moment().startOf('month').valueOf();
const addMonths = (month: Timestamp, count: number) => moment(month).add(count, 'month').valueOf();

function Month({ days, onShowNight }: { days: CalendarDay[] | undefined; onShowNight: () => void }) {
  return (
    <div className="grid">
      {days?.map(day => (
        <div key={day.day} className="cell">
          <CalendarItem {...day} onShowNight={onShowNight} />
        </div>
      ))}
    </div>
  );
}

/**
 * Header and months of the calendar, mounted only while the calendar is open. The previous, the current and the
 * next month are side by side, to swipe between them like the pages of a carousel (see the details).
 */
function CalendarContent({ onClose }: { onClose: () => void }) {
  // opens on the month of the night chosen in the filter
  const date = useDate();
  const [month, setMonth] = useState(() => moment(date).startOf('month').valueOf());
  const prevMonth = addMonths(month, -1);
  const nextMonth = addMonths(month, 1);
  const months = useMemo(() => [month, addMonths(month, -1), addMonths(month, 1)], [month]);
  const days = useCalendarMonths(months);

  const handlePrevMonth = useCallback(() => setMonth(month => addMonths(month, -1)), []);
  const handleNextMonth = useCallback(() => setMonth(month => addMonths(month, 1)), []);
  const handleThisMonth = useCallback(() => setMonth(getThisMonth()), []);
  const trackRef = useSwipe<HTMLDivElement>({ onPrev: handlePrevMonth, onNext: handleNextMonth }, month);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') handlePrevMonth();
      if (event.key === 'ArrowRight') handleNextMonth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevMonth, handleNextMonth]);

  return (
    <>
      <div className="header">
        <IconButton onClick={onClose} aria-label="Back">
          <ArrowBackIcon />
        </IconButton>
        <h2 className="month">{moment(month).format('MMMM YYYY')}</h2>
        <IconButton onClick={handlePrevMonth} aria-label="Previous month">
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={handleNextMonth} aria-label="Next month">
          <ChevronRightIcon />
        </IconButton>
        <Button onClick={handleThisMonth} disabled={month === getThisMonth()}>
          Today
        </Button>
      </div>
      <div className="carousel">
        {/* keyed by the month, so a neighbor stepped to is kept as it is */}
        <div className="track" ref={trackRef}>
          {[prevMonth, month, nextMonth].map(pageMonth => (
            <div key={pageMonth} className="page">
              <Month days={days[pageMonth]} onShowNight={onClose} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** Full-screen calendar of the nights of a month: twilight, astronomical night and Moon phase day by day */
export default function Calendar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useCloseOnBack(isOpen, onClose);

  return (
    <Dialog fullScreen open={isOpen} onClose={onClose} className="Calendar">
      <CalendarContent onClose={onClose} />
    </Dialog>
  );
}
