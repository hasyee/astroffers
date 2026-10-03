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

/** Waiting for a new service worker longer than this (e.g. offline) reloads anyway */
const ACTIVATION_TIMEOUT = 10 * 1000;

/** Resolves when the service worker gets activated (or turns out to be redundant), or after the timeout */
const waitForActivation = (worker: ServiceWorker) =>
  new Promise<void>(resolve => {
    const timer = setTimeout(resolve, ACTIVATION_TIMEOUT);
    const handleStateChange = () => {
      if (worker.state !== 'activated' && worker.state !== 'redundant') return;
      clearTimeout(timer);
      worker.removeEventListener('statechange', handleStateChange);
      resolve();
    };
    worker.addEventListener('statechange', handleStateChange);
    handleStateChange();
  });

/**
 * Reloads the page with the latest deployed version: a plain reload would still be served by the current
 * service worker from its precache, so the new service worker is fetched and activated first.
 */
export function useReloadToLatestVersion() {
  return useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker?.getRegistration();
      if (registration) {
        await registration.update();
        const worker = registration.installing ?? registration.waiting;
        if (worker) await waitForActivation(worker);
      }
    } catch (error) {
      console.error(error);
    }
    window.location.reload();
  }, []);
}
