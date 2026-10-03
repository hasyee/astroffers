import { type ChangeEvent, useCallback } from 'react';
import moment from 'moment';
import { Button, Classes, ControlGroup, FormGroup, InputGroup } from '@blueprintjs/core';
import { useDate, useDateSetter } from '../date/date.hooks';
import { getToday } from '../date/date.utils';

const FORMAT = 'YYYY-MM-DD';

/** Dates outside of this range are ignored, e.g. the partial years while a year is being typed */
const MIN_DATE = '1900-01-01';
const MAX_DATE = '2100-12-31';

export default function DateInput() {
  const date = useDate();
  const setDate = useDateSetter();

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = moment(event.target.value, FORMAT, true);
      if (value.isValid() && value.isBetween(MIN_DATE, MAX_DATE, 'day', '[]')) setDate(value.valueOf());
    },
    [setDate]
  );
  const handlePrevDay = useCallback(() => setDate(date => moment(date).subtract(1, 'day').valueOf()), [setDate]);
  const handleNextDay = useCallback(() => setDate(date => moment(date).add(1, 'day').valueOf()), [setDate]);
  const handleToday = useCallback(() => setDate(getToday()), [setDate]);

  return (
    <FormGroup label="Night of">
      <ControlGroup fill>
        <Button
          variant="minimal"
          className={Classes.FIXED}
          icon="chevron-left"
          onClick={handlePrevDay}
          aria-label="Previous night"
        />
        <InputGroup
          type="date"
          fill
          min={MIN_DATE}
          max={MAX_DATE}
          value={moment(date).format(FORMAT)}
          onChange={handleChange}
        />
        <Button
          variant="minimal"
          className={Classes.FIXED}
          icon="chevron-right"
          onClick={handleNextDay}
          aria-label="Next night"
        />
        <Button variant="minimal" className={Classes.FIXED} onClick={handleToday} disabled={date === getToday()}>
          Today
        </Button>
      </ControlGroup>
    </FormGroup>
  );
}
