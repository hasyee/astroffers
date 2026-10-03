import moment from 'moment';
import type { ArcMin, Interval, NgcInfo, Radians, Timestamp } from '../calculator/calculator.types';
import { PI2, normalizeRad, radToDeg } from '../calculator/calculator.units';
import { resolveConstellation, resolveTypes } from '../catalog/catalog.utils';

const NONE = '-';

export const formatTime = (time: Timestamp | null | undefined) =>
  time !== null && time !== undefined && Number.isFinite(time) ? moment(time).format('HH:mm') : NONE;

export const formatIntervalStart = (interval: Interval | null) => formatTime(interval?.start);

export const formatIntervalEnd = (interval: Interval | null) => formatTime(interval?.end);

/** Length of a time span as hh:mm */
export const formatDuration = (duration: number) => {
  const totalMinutes = Math.round(duration / 60 / 1000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

export const formatAltitude = (altitude: Radians | null) =>
  altitude === null ? NONE : `${Math.round(radToDeg(altitude))}°`;

export const formatValue = (value: number | undefined) => (value === undefined ? NONE : String(value));

const formatArcMin = (arcMin: ArcMin) => (arcMin < 1 ? `${Math.round(arcMin * 60)}"` : `${arcMin.toFixed(1)}'`);

export const formatSize = (size?: [ArcMin, ArcMin]) => (size ? size.map(formatArcMin).join(' × ') : 'Unknown');

export const formatDate = (date: Timestamp) => moment(date).format('ddd, D MMM YYYY');

const pad = (value: number) => String(value).padStart(2, '0');

/** Splits a value rounded to whole units into sexagesimal parts, e.g. seconds into hours, minutes and seconds */
const toSexagesimal = (totalUnits: number) => [
  Math.floor(totalUnits / 3600),
  Math.floor(totalUnits / 60) % 60,
  totalUnits % 60
];

/** Right ascension as hours, minutes and seconds */
export const formatRa = (ra: Radians) => {
  const [hours, minutes, seconds] = toSexagesimal(Math.round((normalizeRad(ra) / PI2) * 24 * 3600) % (24 * 3600));
  return `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
};

/** Declination as degrees, arc minutes and arc seconds */
export const formatDec = (de: Radians) => {
  const [degrees, arcMinutes, arcSeconds] = toSexagesimal(Math.round(Math.abs(radToDeg(de)) * 3600));
  return `${de < 0 ? '-' : '+'}${pad(degrees)}° ${pad(arcMinutes)}' ${pad(arcSeconds)}"`;
};

/** Values of a result list row as displayed */
export const toListRow = ({ object, intersection, max, sum, altitudeAtMax }: NgcInfo) => ({
  ngc: object.ngc,
  messier: object.messier,
  name: object.name ?? '',
  types: object.types.join(', '),
  typeNames: resolveTypes(object.types).join(', '),
  constellation: object.constellation,
  constellationName: resolveConstellation(object.constellation),
  from: formatTime(intersection.start),
  to: formatTime(intersection.end),
  max: formatTime(max),
  altitudeAtMax: formatAltitude(altitudeAtMax),
  sum: formatDuration(sum),
  magnitude: formatValue(object.magnitude),
  surfaceBrightness: formatValue(object.surfaceBrightness)
});

/** Values of the details view as displayed */
export const toDetails = ({
  object,
  eqCoordsOnDate,
  hda,
  hda0,
  intersection,
  max,
  altitudeAtMax,
  transit,
  altitudeAtTransit
}: NgcInfo) => ({
  types: resolveTypes(object.types).join(', '),
  constellation: resolveConstellation(object.constellation),
  size: formatSize(object.size),
  magnitude: formatValue(object.magnitude),
  surfaceBrightness: formatValue(object.surfaceBrightness),
  ra: formatRa(object.ra),
  de: formatDec(object.de),
  raOnDate: formatRa(eqCoordsOnDate.ra),
  deOnDate: formatDec(eqCoordsOnDate.de),
  rising: formatIntervalStart(hda0),
  setting: formatIntervalEnd(hda0),
  risingAboveMinAltitude: formatIntervalStart(hda),
  settingBelowMinAltitude: formatIntervalEnd(hda),
  from: formatTime(intersection.start),
  to: formatTime(intersection.end),
  max: formatTime(max),
  altitudeAtMax: formatAltitude(altitudeAtMax),
  transit: formatTime(transit),
  altitudeAtTransit: formatAltitude(altitudeAtTransit)
});
