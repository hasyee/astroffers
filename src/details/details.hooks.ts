import { useCallback, useMemo } from 'react';
import { getHorizontalCoordSeries } from '../calculator/calculator.coords';
import type { NgcInfo } from '../calculator/calculator.types';
import { getLocation } from '../calculator/calculator.units';
import { useDisplayedList } from '../list/list.hooks';
import { useResultList, useResultParams } from '../result/result.hooks';
import { useGoBack, useMatchPath, useNavigate } from '../router/router.hooks';

/** Route of the details view */
const DETAILS_PATH = 'objects/:ngc';

const getDetailsPath = (ngc: number) => `/objects/${ngc}`;

/** NGC number of the object opened in the details view, from the route */
export const useOpenedNgc = () => {
  const params = useMatchPath(DETAILS_PATH);
  const ngc = Number(params?.ngc);
  return params && Number.isInteger(ngc) ? ngc : null;
};

/** The details route is open, even with an unknown object */
export const useIsDetailsRoute = () => !!useMatchPath(DETAILS_PATH);

export const useOpenDetails = () => {
  const navigate = useNavigate();
  return useCallback((ngc: number) => navigate(getDetailsPath(ngc)), [navigate]);
};

/** Steps to another object without a history entry, so the back button closes the details */
export const useStepDetails = () => {
  const navigate = useNavigate({ replace: true });
  return useCallback((ngc: number) => navigate(getDetailsPath(ngc)), [navigate]);
};

export const useCloseDetails = () => useGoBack();

export const useOpenedNgcInfo = () => {
  const ngc = useOpenedNgc();
  const list = useResultList();
  return useMemo(() => (ngc === null ? null : (list.find(({ object }) => object.ngc === ngc) ?? null)), [ngc, list]);
};

/** The previous and next objects of the displayed list */
export const useAdjacentNgcInfos = (): [prev: NgcInfo | null, next: NgcInfo | null] => {
  const ngc = useOpenedNgc();
  const list = useDisplayedList();
  return useMemo(() => {
    const index = list.findIndex(({ object }) => object.ngc === ngc);
    if (index < 0) return [null, null];
    return [list[index - 1] ?? null, list[index + 1] ?? null];
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
