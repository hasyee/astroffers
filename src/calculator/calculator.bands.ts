import moment from 'moment';
import type { Band, Bands, Degrees, Interval, NightInfo, Timestamp } from './calculator.types';
import type { Coords } from '../location/location.types';
import { getNightInfo } from './calculator.night';
import { toPrevDay } from './calculator.time';

const DAY_IN_MINS = 24 * 60;

type IntervalName = keyof Bands;

type DayInterval = [Timestamp, Timestamp];

/**
 * Night infos and bands of consecutive days. A night starting on a day reaches into the next one, so the bands of a
 * day come from its own night and the night of the previous day (from astro-calendar).
 */
export default (days: Timestamp[], coords: Coords, twilight: Degrees): { info: NightInfo; bands: Bands }[] => {
  const getInfo = (day: Timestamp) => getNightInfo(day, coords.lat, coords.lng, twilight);
  const infos = days.map(getInfo);
  const prevInfo = days.length ? getInfo(toPrevDay(days[0])) : null;

  return days.map((day, i) => {
    const prev = i > 0 ? infos[i - 1] : prevInfo!;
    const getBandsOf = (name: IntervalName) => getBands(day, prev[name], infos[i][name]);
    return {
      info: infos[i],
      bands: {
        night: getBandsOf('night'),
        astroNight: getBandsOf('astroNight'),
        moonlessNight: getBandsOf('moonlessNight')
      }
    };
  });
};

const getBands = (day: Timestamp, ...intervals: (Interval | null)[]): Band[] =>
  intervals
    .map(interval => forceIntervalToDay(interval, day))
    .filter((interval): interval is DayInterval => !!interval)
    .map(bandToFraction);

// An open-ended bound (±Infinity) means the interval goes on beyond the day, so it is clamped to the day like any
// other date. An inverted interval (start after end) comes from days where the sun neither sets nor rises on one
// side of the night, i.e. there is no night to show.
const forceIntervalToDay = (interval: Interval | null, day: Timestamp): DayInterval | null => {
  if (!interval || interval.start > interval.end) return null;
  return [forceDateToDay(interval.start, day), forceDateToDay(interval.end, day)];
};

const forceDateToDay = (date: Timestamp, day: Timestamp): Timestamp => {
  const startOfDay = moment(day).startOf('day').valueOf();
  const endOfDay = moment(day).endOf('day').valueOf();
  return Math.min(Math.max(date, startOfDay), endOfDay);
};

const bandToFraction = ([start, end]: DayInterval): Band => [timeToFraction(start), timeToFraction(end)];

const timeToFraction = (time: Timestamp): number => {
  const date = moment(time);
  const fraction = (date.hours() * 60 + date.minutes()) / DAY_IN_MINS;
  return 1 - fraction < 0.001 ? 1 : fraction;
};
