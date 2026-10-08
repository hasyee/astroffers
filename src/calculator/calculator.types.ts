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

/** A moonrise or a moonset */
export type MoonCross = { type: 'rise' | 'set'; time: Timestamp };

export type NightInfo = {
  night: Interval | null;
  astroNight: Interval | null;
  moonlessNight: Interval | null;
  /**
   * The moonrises and moonsets of the day of the clock face (from the noon of the date to the next noon), in order; a
   * single one with the other one beside it, before the noon or after the next noon
   */
  moonCrosses: MoonCross[];
  moonPhase: number;
  moonIllumination: number;
};

export type BrightnessType = 'magnitude' | 'surfaceBrightness';

/** The part of the night the objects are observed in, by its key in `NightInfo` */
export type ObservationWindow = 'moonlessNight' | 'astroNight' | 'night';

/**
 * Object of the NGC 2000 catalog, as stored in `catalog.json`, or a body of the Solar System at the time of the
 * calculation (`solar/`)
 */
export type NgcObject = {
  /** `m<Messier number>` for a Messier object, else `ngc<NGC number>` (e.g. `m27`, `ngc884`); in the route too */
  id: string;
  /** Missing for the Messier objects without an NGC number (M24, M25, M40, M45), at the end of the catalog */
  ngc?: number;
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
  /** The credit of its photo, shown instead of the DSS2 preview (the bodies of the Solar System, which move on the sky) */
  photo?: Photo;
  /** The name of the object in Stellarium Web, when it is not its id upper-cased (the bodies of the Solar System) */
  skySource?: string;
  /** The title of its Wikipedia article, when it is not `Messier <n>` or `NGC <n>` (the bodies of the Solar System) */
  wikipedia?: string;
};

/** Credit and license of the photo of an object, linking to its source page */
export type Photo = { credit: string; page: string };

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
  observationWindow: ObservationWindow;
  /** Which of the magnitude and the surface brightness is limited */
  brightnessLimitType: BrightnessType;
  magnitude: number;
  surfaceBrightness: number;
  types: SetFilter;
  constellations: SetFilter;
};

/** Everything a calculation depends on */
export type CalcParams = { date: Timestamp; coords: Coords; filter: ObjectFilter };

export type CalcResult = { params: CalcParams; nightInfo: NightInfo; list: NgcInfo[] };

/** Everything the night depends on */
export type NightParams = { date: Timestamp; coords: Coords; twilight: number };

export type NightResult = { params: NightParams; nightInfo: NightInfo };

/** Worker protocol: the night is requested on its own too, to show it before the list (see `useCalculation`) */
export type CalcRequest =
  { jobId: number; type: 'night'; params: NightParams } | { jobId: number; type: 'result'; params: CalcParams };
export type CalcResponse =
  { jobId: number; type: 'night'; night: NightResult } | { jobId: number; type: 'result'; result: CalcResult };

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
