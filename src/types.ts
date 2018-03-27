import { NgcInfo, NightInfo, SetFilter, BirghtnessType } from 'astroffers-core';

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
  brightnessFilter: BirghtnessType;
  magnitude: number;
  surfaceBrightness: number;
  types: SetFilter;
  constellations: SetFilter;
};

export type Settings = {
  sortBy: ListItemProp;
};

export type Result = {
  filter: Filter;
  nightInfo: NightInfo;
  list: NgcInfo[];
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
