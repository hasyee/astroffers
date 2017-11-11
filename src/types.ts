export type State = {
  filter: Filter;
};

export type Filter = {
  date: number;
  magnitude: number;
  latitude: number;
  longitude: number;
  twilight: number;
  altitude: number;
};
