import { NgcInfo, NightInfo } from './calcs/types';

export type State = {
  filter: Filter;
  result: Result;
};

export type Filter = {
  date: number;
  magnitude: number;
  latitude: number;
  longitude: number;
  twilight: number;
  altitude: number;
};

export type Result = {
  nightInfo: NightInfo;
  list: NgcInfo[];
};
