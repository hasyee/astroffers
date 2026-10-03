import { useMemo } from 'react';
import type Highcharts from 'highcharts';
import type { Interval, NightInfo, Timestamp } from '../calculator/calculator.types';
import { getIntersection } from '../calculator/calculator.interval';
import { toMidnight, toNextDay, toNoon } from '../calculator/calculator.time';
import Chart from '../chart/chart';
import { DAYLIGHT, MOONLESS_NIGHT, MOON_NIGHT, TEXT_MUTED, TWILIGHT } from '../chart/chart.colors';

/** The day from noon to the next noon, split at midnight, since the clock face has 24 hours only */
const getHalfDays = (date: Timestamp): Interval[] => [
  { start: toNoon(date), end: toMidnight(date) },
  { start: toMidnight(date), end: toNoon(toNextDay(date)) }
];

const getHours = (time: Timestamp, isEnd = false) => {
  const date = new Date(time);
  const hours = date.getHours() + date.getMinutes() / 60;
  return isEnd && hours === 0 ? 24 : hours;
};

const getBands = (date: Timestamp, interval: Interval | null, color: string): Highcharts.XAxisPlotBandsOptions[] =>
  interval
    ? getHalfDays(date)
        .map(halfDay => getIntersection(halfDay, interval))
        .filter((part): part is Interval => !!part)
        .map(({ start, end }) => ({
          from: getHours(start),
          to: getHours(end, true),
          color
        }))
    : [];

const getOptions = (
  date: Timestamp,
  { night, astroNight, moonlessNight }: NightInfo,
  size: number
): Highcharts.Options => ({
  // the hour labels fit only around a large enough clock face
  chart: { polar: true, height: size, width: size, margin: size >= 100 ? 14 : 1 },
  tooltip: { enabled: false },
  pane: {
    startAngle: 0,
    endAngle: 360,
    size: '100%',
    background: [{ backgroundColor: 'transparent', borderWidth: 0 }]
  },
  xAxis: {
    min: 0,
    max: 24,
    tickInterval: 6,
    lineWidth: 0,
    gridLineWidth: 0,
    labels: { enabled: size >= 100, distance: 6, style: { color: TEXT_MUTED, fontSize: '10px' } },
    plotBands: [
      { from: 0, to: 24, color: DAYLIGHT },
      ...getBands(date, night, TWILIGHT),
      ...getBands(date, astroNight, MOON_NIGHT),
      ...getBands(date, moonlessNight, MOONLESS_NIGHT)
    ]
  },
  yAxis: { labels: { enabled: false }, gridLineWidth: 0 },
  series: [{ type: 'line', data: [] }]
});

/** 24-hour clock face showing the daylight, the twilight and the night with and without the Moon */
export default function NightChart({
  date,
  nightInfo,
  size = 120
}: {
  date: Timestamp;
  nightInfo: NightInfo;
  size?: number;
}) {
  const options = useMemo(() => getOptions(date, nightInfo, size), [date, nightInfo, size]);
  return <Chart options={options} />;
}
