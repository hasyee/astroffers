import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayOutlinedIcon from '@mui/icons-material/TodayOutlined';
import type { CalendarDay, Timestamp } from '../calculator/calculator.types';
import { useDate } from '../date/date.hooks';
import { useSwipe } from '../swipe/swipe.hooks';
import { toMonth, useCalendarMonths } from './calendar.hooks';
import CalendarItem from './calendar.item';
import './calendar.scss';

const getThisMonth = () => toMonth(Date.now());
const addMonths = (month: Timestamp, count: number) => moment(month).add(count, 'month').valueOf();

function Month({ days, selectedDay }: { days: CalendarDay[] | undefined; selectedDay: Timestamp }) {
  return (
    <div className="grid">
      {days?.map(day => (
        <div key={day.day} className="cell">
          <CalendarItem {...day} isSelected={day.day === selectedDay} />
        </div>
      ))}
    </div>
  );
}

/**
 * Header and months of the calendar, mounted only while the calendar is open. The previous, the current and the
 * next month are side by side, to swipe between them like the pages of a carousel (see the details).
 */
function CalendarContent() {
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedDay = useDate();
  // opens on the month of the chosen night
  const [month, setMonth] = useState(() => toMonth(selectedDay));

  const prevMonth = addMonths(month, -1);
  const nextMonth = addMonths(month, 1);
  const months = useMemo(() => [month, addMonths(month, -1), addMonths(month, 1)], [month]);
  const days = useCalendarMonths(months);

  const handlePrevMonth = useCallback(() => setMonth(month => addMonths(month, -1)), [setMonth]);
  const handleNextMonth = useCallback(() => setMonth(month => addMonths(month, 1)), [setMonth]);
  const handleThisMonth = useCallback(() => setMonth(getThisMonth()), [setMonth]);
  const trackRef = useSwipe<HTMLDivElement>({ onPrev: handlePrevMonth, onNext: handleNextMonth }, month);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // not while typing into a field or in an overlay (e.g. stepping between the objects of the details)
      if (event.target !== document.body && !rootRef.current?.contains(event.target as Node)) return;
      if (event.key === 'ArrowLeft') handlePrevMonth();
      if (event.key === 'ArrowRight') handleNextMonth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevMonth, handleNextMonth]);

  return (
    <div className="content" ref={rootRef}>
      <div className="header">
        <h2 className="month">{moment(month).format('MMMM YYYY')}</h2>
        <IconButton onClick={handlePrevMonth} aria-label="Previous month">
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={handleNextMonth} aria-label="Next month">
          <ChevronRightIcon />
        </IconButton>
        <IconButton onClick={handleThisMonth} disabled={month === getThisMonth()} aria-label="This month">
          <TodayOutlinedIcon />
        </IconButton>
      </div>
      <div className="carousel">
        {/* keyed by the month, so a neighbor stepped to is kept as it is */}
        <div className="track" ref={trackRef}>
          {[prevMonth, month, nextMonth].map(pageMonth => (
            <div key={pageMonth} className="page">
              <Month days={days[pageMonth]} selectedDay={selectedDay} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Calendar of the nights of a month above the summary, opened by the date in the header: twilight, astronomical
 * night and Moon phase day by day; a click on a day chooses its night. A card of about half of the screen on a wide
 * screen; on a phone it fills the screen with the summary, instead of the list.
 */
export default function Calendar({ isOpen, compact = false }: { isOpen: boolean; compact?: boolean }) {
  if (compact)
    return isOpen ? (
      <div className="Calendar compact">
        <CalendarContent />
      </div>
    ) : null;

  return (
    <Collapse in={isOpen} unmountOnExit className="CalendarCollapse">
      <div className="Calendar">
        <CalendarContent />
      </div>
    </Collapse>
  );
}
