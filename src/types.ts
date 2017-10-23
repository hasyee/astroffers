export type Loc = {
  lat: number;
  lon: number;
};

export type Eq = {
  ra: number;
  de: number;
};

export type Az = {
  az: number;
  alt: number;
};

export type Hms = {
  hour?: number;
  min?: number;
  sec?: number;
};

export type Dms = {
  deg?: number;
  min?: number;
  sec?: number;
};
