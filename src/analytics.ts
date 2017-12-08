import { stringify } from 'qs';
import { remote } from 'electron';
import { machineIdSync } from 'node-machine-id';

const TRACK_ID = 'UA-110578592-1';

const send = (hitType: string, params?: any) => {
  const screen = remote.screen.getPrimaryDisplay();
  return fetch(
    `https://www.google-analytics.com/collect?${stringify({
      v: 1,
      t: hitType,
      tid: TRACK_ID,
      cid: machineIdSync(),
      an: remote.app.getName(),
      av: remote.app.getVersion(),
      ul: navigator.language,
      ua: navigator.userAgent.replace(/astroffers\/\d+\.\d+\.\d+ /, '').replace(/Electron\/\d+\.\d+\.\d+ /, ''),
      vp: `${window.innerWidth}x${window.innerHeight}`,
      sr: `${screen.size.width}x${screen.size.height}`,
      ...params
    })}`
  );
};

export const event = (category: string, action: string, label?: string, value?: string | number) =>
  send('event', {
    ec: category,
    ea: action,
    el: label,
    ev: value
  });

export const screen = (screenName: string) => send('screenview', { cd: screenName });
