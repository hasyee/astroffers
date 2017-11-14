import { NgcInfo } from './calcs/types';

export type State = {
  filter: Filter;
  result: NgcInfo[];
};

export type Filter = {
  date: number;
  magnitude: number;
  latitude: number;
  longitude: number;
  twilight: number;
  altitude: number;
};
