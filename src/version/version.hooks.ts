import { useCallback } from 'react';
import { currentVersion } from './version.utils';

export const useCurrentVersion = () => currentVersion;

/** Fetches the version of the latest deployed build, or an empty string if it is unavailable. */
export function useFetchLatestVersion() {
  return useCallback(async () => {
    try {
      const version = await fetch('/version', { cache: 'no-store' }).then(res => res.text());
      return version.trim().substring(0, 8);
    } catch (error) {
      return '';
    }
  }, []);
}
