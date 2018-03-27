import { Timestamp, Deg, Eq, Az, CoordSeries } from './types';
import { getLocation } from './units';
import { toNoon, toNextDay } from './time';
import { eqToAz } from './coords';

export const getHorizontalCoordSeries = (time: Timestamp, latitude: Deg, longitude: Deg, eq: Eq): CoordSeries<Az> => {
  const location = getLocation(latitude, longitude);
  const todayNoon = toNoon(time);
  const nextDayNoon = toNextDay(todayNoon);
  const length = (nextDayNoon - todayNoon) / 1000 / 60;
  return Array.from({ length }).map((_, i) => {
    const time = todayNoon + i * 1000 * 60;
    return {
      time,
      coord: eqToAz(time, location, eq)
    };
  });
};
