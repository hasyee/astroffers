import { useCallback, useState } from 'react';
import moment from 'moment';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDate } from '../date/date.hooks';
import { useCloseOnBack } from '../history/history.hooks';
import { useCalendarDays } from './calendar.hooks';
import CalendarItem from './calendar.item';
import './calendar.scss';

const getThisMonth = () => moment().startOf('month').valueOf();

/** Header and grid of the calendar, mounted only while the calendar is open */
function CalendarContent({ onClose }: { onClose: () => void }) {
  // opens on the month of the night chosen in the filter
  const date = useDate();
  const [month, setMonth] = useState(() => moment(date).startOf('month').valueOf());
  const days = useCalendarDays(month);

  const handlePrevMonth = useCallback(() => setMonth(month => moment(month).subtract(1, 'month').valueOf()), []);
  const handleNextMonth = useCallback(() => setMonth(month => moment(month).add(1, 'month').valueOf()), []);
  const handleThisMonth = useCallback(() => setMonth(getThisMonth()), []);

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
      <div className="grid">
        {days.map(day => (
          <div key={day.day} className="cell">
            <CalendarItem {...day} onShowNight={onClose} />
          </div>
        ))}
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
