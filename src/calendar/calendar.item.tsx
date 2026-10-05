import { useCallback } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import type { CalendarDay } from '../calculator/calculator.types';
import { useDateSetter } from '../date/date.hooks';
import { getToday } from '../date/date.utils';
import Moon from '../moon/moon';
import Bands from './calendar.bands';

/** A day of the calendar; a click chooses its night */
export default function CalendarItem({
  day,
  isOtherMonth,
  info,
  bands,
  isSelected
}: CalendarDay & { isSelected: boolean }) {
  const setDate = useDateSetter();
  const handleClick = useCallback(() => setDate(day), [day, setDate]);

  return (
    <div
      className={classnames('CalendarItem', {
        'other-month': isOtherMonth,
        today: day === getToday(),
        selected: isSelected
      })}
      onClick={handleClick}
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
  );
}
