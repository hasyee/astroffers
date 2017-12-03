import { NgcInfo, NightInfo } from './calcs/types';

export type State = {
  appInfo: AppInfo;
  filter: Filter;
  result: Result;
  isFiltering: boolean;
  openedDetails: number;
};

export type AppInfo = {
  clientId: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  feedback: string;
  homepage: string;
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
  nightInfo: NightInfo;
  list: NgcInfo[];
};

export type TypeFilter = {
  [typeKey: string]: boolean;
};
