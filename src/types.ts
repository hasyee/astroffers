import { NgcInfo, NightInfo } from './calcs/types';

export type State = {
  packageJson: object;
  filter: Filter;
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

export type Result = {
  filter: Filter;
  nightInfo: NightInfo;
  list: NgcInfo[];
};

export type TypeFilter = {
  [typeKey: string]: boolean;
};
