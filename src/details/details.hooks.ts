import { useCallback, useMemo } from 'react';
import { getHorizontalCoordSeries } from '../calculator/calculator.coords';
import type { NgcInfo } from '../calculator/calculator.types';
import { getLocation } from '../calculator/calculator.units';
import { useDisplayedList } from '../list/list.hooks';
import { useResultList, useResultParams } from '../result/result.hooks';
import { useGoBack, useMatchPath, useNavigate } from '../router/router.hooks';

/** Route of the details view: the id of the object (e.g. `/m27`, `/ngc884`) */
const DETAILS_PATH = ':id';

const getDetailsPath = (id: string) => `/${id}`;

/** Id of the object opened in the details view, from the route */
export const useOpenedId = () => useMatchPath(DETAILS_PATH)?.id ?? null;

/** The details route is open, even with an unknown object */
export const useIsDetailsRoute = () => !!useMatchPath(DETAILS_PATH);

export const useOpenDetails = () => {
  const navigate = useNavigate();
  return useCallback((id: string) => navigate(getDetailsPath(id)), [navigate]);
};

/** Steps to another object without a history entry, so the back button closes the details */
export const useStepDetails = () => {
  const navigate = useNavigate({ replace: true });
  return useCallback((id: string) => navigate(getDetailsPath(id)), [navigate]);
};

export const useCloseDetails = () => useGoBack();

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
