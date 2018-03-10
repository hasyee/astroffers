import { NgcInfo, NightInfo } from './calcs/types';

export type State = {
  packageJson: object;
  filter: Filter;
  settings: Settings;
  result: Result;
  isFiltering: boolean;
  openedDetails: number;
};

export type Filter = {
  date: number;
  latitude: number;
  longitude: number;
  twilight: number;
  altitude: number;
  moonless: boolean;
  brightnessFilter: string;
  magnitude: number;
  surfaceBrightness: number;
  types: TypeFilter;
};

export type Settings = {
  sortBy: ListItemProp;
};

export type Result = {
  filter: Filter;
  nightInfo: NightInfo;
  list: NgcInfo[];
};

export type TypeFilter = {
  [typeKey: string]: boolean;
};

export enum ListItemProp {
  NGC = 'ngc',
  FROM = 'from',
  TO = 'to',
  MAGNITUDE = 'magnitude',
  SURFACE_BRIGHTNESS = 'surfaceBrightness',
  TYPE = 'type',
  MAX = 'max',
  SUM = 'sum'
}
