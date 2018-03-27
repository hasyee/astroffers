import moment = require('moment');
import { NgcInfo, radToDeg, stringifyTimeDiff } from 'astroffers-core';

export default ({
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
