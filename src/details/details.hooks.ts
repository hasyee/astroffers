import { useCallback, useMemo } from 'react';
import { getHorizontalCoordSeries } from '../calculator/calculator.coords';
import type { NgcInfo } from '../calculator/calculator.types';
import { getLocation } from '../calculator/calculator.units';
import { useDisplayedList } from '../list/list.hooks';
import { createStateContext, useStateSetter, useStateValue } from '../provider/state.hooks';
import { useResultList, useResultParams } from '../result/result.hooks';

/** NGC number of the object opened in the details view */
export const DetailsContext = createStateContext<number | null>(null);

export const useOpenedNgc = () => useStateValue(DetailsContext);

export const useOpenedNgcSetter = () => useStateSetter(DetailsContext);

export const useCloseDetails = () => {
  const setOpenedNgc = useOpenedNgcSetter();
  return useCallback(() => setOpenedNgc(null), [setOpenedNgc]);
};

export const useOpenedNgcInfo = () => {
  const ngc = useOpenedNgc();
  const list = useResultList();
  return useMemo(() => (ngc === null ? null : (list.find(({ object }) => object.ngc === ngc) ?? null)), [ngc, list]);
};

/** The previous (-1) and next (+1) objects of the displayed list */
export const useAdjacentNgcs = (): [prev: number | null, next: number | null] => {
  const ngc = useOpenedNgc();
  const list = useDisplayedList();
  return useMemo(() => {
    const index = list.findIndex(({ object }) => object.ngc === ngc);
    if (index < 0) return [null, null];
    return [list[index - 1]?.object.ngc ?? null, list[index + 1]?.object.ngc ?? null];
  }, [ngc, list]);
};

/** Altitude and azimuth of the object minute by minute, from the noon of the date to the next noon */
export const useHorizontalCoords = (ngcInfo: NgcInfo | null) => {
  const params = useResultParams();
  return useMemo(
    () =>
      ngcInfo && params
        ? getHorizontalCoordSeries(
            params.date,
            getLocation(params.coords.lat, params.coords.lng),
            ngcInfo.eqCoordsOnDate
          )
        : null,
    [ngcInfo, params]
  );
};
