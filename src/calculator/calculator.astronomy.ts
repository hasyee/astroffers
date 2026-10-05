import { Equator, Horizon, Observer } from 'astronomy-engine';
import type { Body } from 'astronomy-engine';
import type { Degrees, Position, Timestamp } from './calculator.types';
import { radToDeg } from './calculator.units';

/** The location as an observer of astronomy-engine, at sea level */
export const toObserver = ({ lat, lon }: Position) => new Observer(radToDeg(lat), radToDeg(lon), 0);

/**
 * Geometric altitude of the center of a body, without the refraction: the altitudes of the searches of risings and
 * settings (e.g. -0.833° for the sunset, which includes the refraction at the horizon) are geometric too
 */
export const getAltitude = (body: Body, time: Timestamp, observer: Observer): Degrees => {
  const date = new Date(time);
  const { ra, dec } = Equator(body, date, observer, true, true);
  return Horizon(date, observer, ra, dec).altitude;
};

/** The time of the event found by a search of astronomy-engine after `from` within `limit` days, or null */
export const searchTime = (
  search: (from: Date, limit: number) => { date: Date } | null,
  from: Timestamp,
  limit: number
): Timestamp | null => {
  if (limit <= 0) return null;
  const event = search(new Date(from), limit);
  return event ? event.date.getTime() : null;
};
