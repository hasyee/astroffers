const moment = require('moment');
import {
  NgcInfo,
  radToDeg,
  dmsToString,
  hmsToString,
  stringifyTimeDiff,
  radToHmsString,
  radToDmsString
} from 'astroffers-core';

export const displayToList = ({
  object: { ngc, messier, name, constellation, magnitude, surfaceBrightness, types },
  intersection: { start, end },
  max,
  sum,
  altitudeAtMax
}: NgcInfo) => ({
  ngc,
  messier,
  name,
  types,
  constellation,
  from: moment(start).format('HH:mm'),
  to: moment(end).format('HH:mm'),
  max: `${moment(max).format('HH:mm')} / ${Math.round(radToDeg(altitudeAtMax))}°`,
  sum: stringifyTimeDiff(sum),
  magnitude,
  surfaceBrightness
});

export const displayToDetails = (ngcInfo: NgcInfo) => {
  const {
    object: { ngc, messier, name, types, constellation, size, magnitude, surfaceBrightness, eqCoords },
    eqCoordsOnDate,
    max,
    sum,
    transit,
    hda,
    hda0,
    intersection,
    altitudeAtMax,
    altitudeAtTransit
  } = ngcInfo;
  return {
    ngc,
    title: getTitle(ngcInfo),
    types,
    constellation,
    size: size ? `${dmsToString(size[0])} × ${dmsToString(size[1])}` : 'Unknown',
    magnitude,
    surfaceBrightness,
    ra: hmsToString(eqCoords.ra),
    de: dmsToString(eqCoords.de),
    raOnDate: radToHmsString(eqCoordsOnDate.ra),
    deOnDate: radToDmsString(eqCoordsOnDate.de),
    rising: Number.isFinite(hda0.start) ? moment(hda0.start).format('HH:mm') : '-',
    setting: Number.isFinite(hda0.end) ? moment(hda0.end).format('HH:mm') : '-',
    risingAboveMinAltitude: Number.isFinite(hda.start) ? moment(hda.start).format('HH:mm') : '-',
    settingBelowMinAltitude: Number.isFinite(hda.end) ? moment(hda.end).format('HH:mm') : '-',
    from: moment(intersection.start).format('HH:mm'),
    to: moment(intersection.end).format('HH:mm'),
    max: max ? moment(max).format('HH:mm') : '-',
    altitudeAtMax: altitudeAtMax ? Math.round(radToDeg(altitudeAtMax)) + '°' : '-',
    transit: transit ? moment(transit).format('HH:mm') : '-',
    altitudeAtTransit: altitudeAtTransit ? Math.round(radToDeg(altitudeAtTransit)) + '°' : '-'
  };
};

export const getTitle = (ngcInfo: NgcInfo): string => {
  const object = ngcInfo ? ngcInfo.object : null;
  if (!object) return 'Unknown';
  return [ `NGC ${object.ngc}`, object.messier ? `M ${object.messier}` : null, object.name || null ]
    .filter(_ => _)
    .join(' | ');
};
