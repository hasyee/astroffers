import { stringify } from 'qs';
import { AppInfo } from './types';
import { App } from 'electron';

const trackId = 'UA-110578592-1';

const send = ({ name, version, clientId, platform, language }: AppInfo, hitType: string, params?: any) =>
  fetch(
    `https://www.google-analytics.com/collect?${stringify({
      v: 1,
      t: hitType,
      tid: trackId,
      cid: clientId,
      an: name,
      av: version,
      ul: language,
      ua: navigator.userAgent.replace(/astroffers\/\d+\.\d+\.\d+ /, '').replace(/Electron\/\d+\.\d+\.\d+ /, ''),
      aiid: `org.${platform}.astroffers`,
      ...params
    })}`
  );

export const event = (appInfo: AppInfo, category: string, action: string, label?: string, value?: string | number) =>
  send(appInfo, 'event', {
    ec: category,
    ea: action,
    el: label,
    ev: value
  });

export const screen = (appInfo: AppInfo, screenName: string) => send(appInfo, 'screenview', { cd: screenName });
