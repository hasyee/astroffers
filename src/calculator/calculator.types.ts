import type { Coords } from '../location/location.types';

export type Timestamp = number;
export type Degrees = number;
export type Radians = number;
/** Arc minutes */
export type ArcMin = number;
/** Minutes of time */
export type Minutes = number;

/** Time span; bounds are `-Infinity` / `Infinity` when open-ended (e.g. polar day/night). */
export type Interval = { start: Timestamp; end: Timestamp };

/** Geographic position in radians, as used by the calculators. */
export type Position = { lat: Radians; lon: Radians };

/** Equatorial coordinates */
export type Eq = { ra: Radians; de: Radians };

/** Horizontal coordinates */
export type Az = { az: Radians; alt: Radians };

export type CoordSeries<Coord> = { time: Timestamp; coord: Coord }[];

export type NightInfo = {
  night: Interval | null;
  moonNight: Interval | null;
  astroNight: Interval | null;
  moonlessNight: Interval | null;
  moonPhase: number;
  moonIllumination: number;
};

export type BrightnessType = 'magnitude' | 'surfaceBrightness';

/** Object of the NGC 2000 catalog, as stored in `catalog.json` */
export type NgcObject = {
  ngc: number;
  messier?: number;
  name?: string;
  /** Right ascension (J2000) */
  ra: Radians;
  /** Declination (J2000) */
  de: Radians;
  constellation: string;
  size?: [ArcMin, ArcMin];
  magnitude?: number;
  surfaceBrightness?: number;
  types: string[];
};

/** Visibility of an object during the observed night */
export type NgcInfo = {
  object: NgcObject;
  eqCoordsOnDate: Eq;
  /** Visibility above the minimum altitude during the night */
  intersection: Interval;
  /** Time of the best visibility during the night */
  max: Timestamp | null;
  /** Length of the visibility */
  sum: number;
  /** Half-day arc above the minimum altitude */
  hda: Interval | null;
  /** Half-day arc above the horizon */
  hda0: Interval | null;
  altitudeAtMax: Radians | null;
  altitudeAtTransit: Radians | null;
  transit: Timestamp | null;
};

/** Whether each key (object type or constellation) is selected */
export type SetFilter = Record<string, boolean>;

export type ObjectFilter = {
  observationTime: Minutes;
  /** Maximum altitude of the Sun */
  twilight: Degrees;
  /** Minimum altitude of the objects */
  altitude: Degrees;
  moonless: boolean;
  brightnessFilter: BrightnessType;
  magnitude: number;
  surfaceBrightness: number;
  types: SetFilter;
  constellations: SetFilter;
};

/** Everything a calculation depends on */
export type CalcParams = { date: Timestamp; coords: Coords; filter: ObjectFilter };

export type CalcResult = { params: CalcParams; nightInfo: NightInfo; list: NgcInfo[] };

/** Worker protocol */
export type CalcRequest = { jobId: number; params: CalcParams };
export type CalcResponse = { jobId: number; result: CalcResult };

/** Start and end of a band as a fraction (0..1) of the day. */
export type Band = [start: number, end: number];

/** Parts of a calendar day with twilight, astronomical night and moonless night */
export type Bands = {
  night: Band[];
  astroNight: Band[];
  moonlessNight: Band[];
};

export type CalendarDay = {
  day: Timestamp;
  /** The day belongs to the previous or the next month */
  isOtherMonth: boolean;
  info: NightInfo;
  bands: Bands;
};

/** Calendar worker protocol, month by month; `key` identifies the location and the twilight of the request */
export type CalendarParams = { month: Timestamp; weekOffset: number; coords: Coords; twilight: Degrees };
export type CalendarRequest = { key: string; params: CalendarParams };
export type CalendarResponse = { key: string; month: Timestamp; days: CalendarDay[] };
