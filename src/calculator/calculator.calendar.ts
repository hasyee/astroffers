import moment from 'moment';
import type { CalendarDay, CalendarParams, Timestamp } from './calculator.types';
import calcBands from './calculator.bands';

/** Days of the month in whole weeks, padded with the days of the previous and the next month */
const getDays = (month: Timestamp, weekOffset: number): { day: Timestamp; isOtherMonth: boolean }[] => {
  const startOfMonth = moment(month).startOf('month');
  const daysInMonth = startOfMonth.daysInMonth();
  const before = (startOfMonth.weekday() - weekOffset + 7) % 7;
  const after = (7 - ((before + daysInMonth) % 7)) % 7;

  return Array.from({ length: before + daysInMonth + after }, (_, i) => ({
    day: startOfMonth
      .clone()
      .add(i - before, 'days')
      .valueOf(),
    isOtherMonth: i < before || i >= before + daysInMonth
  }));
};

export default ({ month, weekOffset, coords, twilight }: CalendarParams): CalendarDay[] => {
  const days = getDays(month, weekOffset);
  const nights = calcBands(
    days.map(({ day }) => day),
    coords,
    twilight
  );
  return days.map((day, i) => ({ ...day, ...nights[i] }));
};
