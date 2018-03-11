import { NgcInfo, NightInfo } from './calcs/types';

export type State = {
  packageJson: any;
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
  observationTime: number;
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
  MESSIER = 'messier',
  NAME = 'name',
  TYPE = 'type',
  CONSTELLATION = 'constellation',
  FROM = 'from',
  TO = 'to',
  MAX = 'max',
  SUM = 'sum',
  MAGNITUDE = 'magnitude',
  SURFACE_BRIGHTNESS = 'surfaceBrightness'
}
