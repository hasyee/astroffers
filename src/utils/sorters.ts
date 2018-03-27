import { ListItemProp } from '../types';
import { NgcInfo } from 'astroffers-core';

const defaultSorter = (propertySelector: Function) => (a: NgcInfo, b: NgcInfo) => {
  const aProp = propertySelector(a);
  const bProp = propertySelector(b);
  if (aProp === undefined && bProp === undefined) return a.object.ngc - b.object.ngc;
  if (aProp === undefined) return +1;
  if (bProp === undefined) return -1;
  if (aProp < bProp) return -1;
  else if (aProp > bProp) return +1;
  else return 0;
};

export default {
  [ListItemProp.NGC]: defaultSorter((object: NgcInfo) => object.object.ngc),
  [ListItemProp.MESSIER]: defaultSorter((object: NgcInfo) => object.object.messier),
  [ListItemProp.NAME]: defaultSorter((object: NgcInfo) => object.object.name),
  [ListItemProp.TYPE]: defaultSorter((object: NgcInfo) => object.object.types[0]),
  [ListItemProp.CONSTELLATION]: defaultSorter((object: NgcInfo) => object.object.constellation),
  [ListItemProp.FROM]: defaultSorter((object: NgcInfo) => object.intersection.start),
  [ListItemProp.TO]: defaultSorter((object: NgcInfo) => object.intersection.end),
  [ListItemProp.MAX]: (a: NgcInfo, b: NgcInfo) => {
    const maxDiff = a.max - b.max;
    return maxDiff === 0 ? a.sum - b.sum : maxDiff;
  },
  [ListItemProp.SUM]: defaultSorter((object: NgcInfo) => object.sum),
  [ListItemProp.MAGNITUDE]: defaultSorter((object: NgcInfo) => object.object.magnitude),
  [ListItemProp.SURFACE_BRIGHTNESS]: defaultSorter((object: NgcInfo) => object.object.surfaceBrightness)
};
