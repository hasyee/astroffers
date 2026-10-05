import { type MouseEvent, useCallback, useState } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import type { CalendarDay } from '../calculator/calculator.types';
import { useDateSetter } from '../date/date.hooks';
import { getToday } from '../date/date.utils';
import { formatDate } from '../display/display.utils';
import Moon from '../moon/moon';
import NightTable from '../summary/summary.night';
import Bands from './calendar.bands';

const formatPercent = (value: number) => `${Math.round(value * 100)}%`;

export default function CalendarItem({
  day,
  isOtherMonth,
  info,
  bands,
  isSelected,
  onShowNight
}: CalendarDay & { isSelected: boolean; onShowNight: () => void }) {
  const setDate = useDateSetter();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const handleShowNight = useCallback(() => {
    setDate(day);
    onShowNight();
  }, [day, setDate, onShowNight]);

  return (
    <>
      <div
        className={classnames('CalendarItem', {
          'other-month': isOtherMonth,
          today: day === getToday(),
          selected: isSelected,
          open: !!anchorEl
        })}
        onClick={handleOpen}
      >
        <header>
          <div className="day">
            <div className="day-number">{moment(day).format('D')}</div>
            <div className="day-name">{moment(day).format('ddd')}</div>
          </div>
          <div className="moon">
            <Moon phase={info.moonPhase} />
          </div>
        </header>
        <Bands {...bands} />
      </div>

      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { className: 'CalendarInfo' } }}
      >
        <div className="heading">
          <div className="date">{formatDate(day)}</div>
          <div className="moon-illumination">Moon illumination {formatPercent(info.moonIllumination)}</div>
        </div>
        <NightTable nightInfo={info} />
        <div className="actions">
          <Button onClick={handleShowNight}>Show objects</Button>
        </div>
      </Popover>
    </>
  );
}
