export type Timestamp = number; // ms

export type Year = number;

export type Century = number;

export type Day = number;

export type Hour = number;

export type ArcMin = number;

export type ArcSec = number;

export type Rad = number;

export type Deg = number;

export type Loc = {
  lat: Rad;
  lon: Rad;
};

export type Eq = {
  ra: Rad;
  de: Rad;
};

export type Az = {
  az: Rad;
  alt: Rad;
};

export type Hms = {
  hour?: Hour;
  min?: ArcMin;
  sec?: ArcSec;
};

export type Dms = {
  deg?: Deg;
  arcMin?: ArcMin;
  arcSec?: ArcSec;
};

export type NGCObject = {
  ngc: number;
  eqCoords: {
    ra: Hms;
    de: Dms;
  };
  type: string;
  constellation: string;
  size: string;
  magnitude: number;
  surfaceBrightness: number;
};
