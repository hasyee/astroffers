import { useCallback, useMemo } from 'react';
import { getHorizontalCoordSeries } from '../calculator/calculator.coords';
import type { NgcInfo } from '../calculator/calculator.types';
import { getLocation } from '../calculator/calculator.units';
import { useDisplayedList } from '../list/list.hooks';
import { useResultList, useResultParams } from '../result/result.hooks';
import { useGoBack, useMatchPath, useNavigate } from '../router/router.hooks';
import { DETAILS_PATH, MAP_PATH, getDetailsPath, getMapPath } from './details.utils';

/** Id of the object opened in the details view or in its star map, from the route */
export const useOpenedId = () => {
  const detailsMatch = useMatchPath(DETAILS_PATH);
  const mapMatch = useMatchPath(MAP_PATH);
  return (detailsMatch ?? mapMatch)?.id ?? null;
};

/** The details route (or the star map's) is open, even with an unknown object */
export const useIsDetailsRoute = () => useOpenedId() !== null;

/** The star map of the object is open in the place of its details */
export const useIsMapRoute = () => !!useMatchPath(MAP_PATH);

export const useOpenDetails = () => {
  const navigate = useNavigate();
  return useCallback((id: string) => navigate(getDetailsPath(id)), [navigate]);
};

/** Steps to another object without a history entry, so the back button closes the details */
export const useStepDetails = () => {
  const navigate = useNavigate({ replace: true });
  return useCallback((id: string) => navigate(getDetailsPath(id)), [navigate]);
};

/** Closes the details, from their star map too (two steps back: the map was opened from the details) */
export const useCloseDetails = () => useGoBack('/', useIsMapRoute() ? 2 : 1);

/** Opens the star map of the object, with a history entry; its stored params (flips) by `useQueryStorage` */
export const useOpenMap = () => {
  const navigate = useNavigate();
  return useCallback((id: string) => navigate(getMapPath(id)), [navigate]);
};

/** Back to the details of the object (history back when opened in the app, else replaced) */
export const useCloseMap = () => {
  const id = useOpenedId();
  return useGoBack(id === null ? '/' : getDetailsPath(id));
};

export const useOpenedNgcInfo = () => {
  const id = useOpenedId();
  const list = useResultList();
  return useMemo(() => (id === null ? null : (list.find(({ object }) => object.id === id) ?? null)), [id, list]);
};

/** The previous and next objects of the displayed list */
export const useAdjacentNgcInfos = (): [prev: NgcInfo | null, next: NgcInfo | null] => {
  const id = useOpenedId();
  const list = useDisplayedList();
  return useMemo(() => {
    const index = list.findIndex(({ object }) => object.id === id);
    if (index < 0) return [null, null];
    return [list[index - 1] ?? null, list[index + 1] ?? null];
  }, [id, list]);
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
