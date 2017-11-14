import { NgcInfo, NightInfo } from './calcs/types';

export type State = {
  filter: Filter;
  result: Result;
  isFiltering: boolean;
};

export type Filter = {
  date: number;
  magnitude: number;
  latitude: number;
  longitude: number;
  twilight: number;
  altitude: number;
  moonless: boolean;
};

export type Result = {
  nightInfo: NightInfo;
  list: NgcInfo[];
};
