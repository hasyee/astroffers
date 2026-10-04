import { type ChangeEvent, useCallback } from 'react';
import moment from 'moment';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useDate, useDateSetter } from '../date/date.hooks';
import { DATE_FORMAT, MAX_DATE, MIN_DATE, getToday, parseDate } from '../date/date.utils';

export default function DateInput() {
  const date = useDate();
  const setDate = useDateSetter();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = parseDate(event.target.value);
      if (value !== null) setDate(value);
    },
    [setDate]
  );
  const handlePrevDay = useCallback(() => setDate(date => moment(date).subtract(1, 'day').valueOf()), [setDate]);
  const handleNextDay = useCallback(() => setDate(date => moment(date).add(1, 'day').valueOf()), [setDate]);
  const handleToday = useCallback(() => setDate(getToday()), [setDate]);

  return (
    <div className="DateInput">
      <IconButton onClick={handlePrevDay} aria-label="Previous night">
        <ChevronLeftIcon />
      </IconButton>
      <TextField
        label="Night of"
        type="date"
        value={moment(date).format(DATE_FORMAT)}
        onChange={handleChange}
        slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: MIN_DATE, max: MAX_DATE } }}
      />
      <IconButton onClick={handleNextDay} aria-label="Next night">
        <ChevronRightIcon />
      </IconButton>
      <Button onClick={handleToday} disabled={date === getToday()}>
        Today
      </Button>
    </div>
  );
}
