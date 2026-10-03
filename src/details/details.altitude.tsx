import { useMemo } from 'react';
import type Highcharts from 'highcharts';
import moment from 'moment';
import type { Az, CoordSeries, Degrees, Interval, NgcInfo, NightInfo } from '../calculator/calculator.types';
import { radToDeg } from '../calculator/calculator.units';
import { toNextDay } from '../calculator/calculator.time';
import Chart from '../chart/chart';
import { DAYLIGHT, HIGHLIGHT, MOONLESS_NIGHT, MOON_NIGHT, TEXT, TWILIGHT } from '../chart/chart.colors';

const HOUR = 3600 * 1000;

/** Band of an interval, clamped to the displayed day, since the night intervals may be open-ended */
const toBand =
  (first: number, last: number) =>
  (interval: Interval | null, color: string): Highcharts.XAxisPlotBandsOptions[] =>
    interval ? [{ from: Math.max(first, interval.start), to: Math.min(last, interval.end), color }] : [];

const toLine = (value: number, text: string, bold = false): Highcharts.XAxisPlotLinesOptions => ({
  value,
  zIndex: 5,
  width: 1,
  color: TEXT,
  label: { text, style: { color: TEXT, fontWeight: bold ? 'bold' : 'normal' } }
});

const getOptions = (
  horizontalCoords: CoordSeries<Az>,
  { transit, max }: NgcInfo,
  { night, astroNight, moonlessNight }: NightInfo,
  minAltitude: Degrees
): Highcharts.Options => {
  const data = horizontalCoords.map(({ time, coord: { alt } }) => [time, radToDeg(alt)]);
  const first = horizontalCoords[0].time;
  const last = horizontalCoords[horizontalCoords.length - 1].time;
  const band = toBand(first, last);
  // the transit is shown only when it is far enough from the best visibility, not to overlap
  const transitLine =
    transit && max && Math.abs(transit - max) > HOUR
      ? [toLine(transit < first ? toNextDay(transit) : transit, 'Transit')]
      : [];
  return {
    chart: { height: 220, spacing: [10, 0, 10, 0] },
    tooltip: {
      formatter() {
        return `${moment(this.x).format('HH:mm')} – ${Math.round(Number(this.y))}°`;
      }
    },
    xAxis: {
      type: 'datetime',
      min: first,
      max: last,
      tickInterval: 2 * HOUR,
      labels: {
        formatter() {
          return moment(this.value).format('HH:mm');
        }
      },
      plotBands: [
        { from: first, to: last, color: DAYLIGHT },
        ...band(night, TWILIGHT),
        ...band(astroNight, MOON_NIGHT),
        ...band(moonlessNight, MOONLESS_NIGHT)
      ],
      plotLines: [...transitLine, ...(max ? [toLine(max, 'Best visibility', true)] : [])]
    },
    yAxis: {
      title: { text: 'Altitude (°)' },
      min: -90,
      max: 90,
      tickInterval: 30,
      plotLines: [{ value: minAltitude, zIndex: 5, width: 2, dashStyle: 'Dash', color: TEXT }]
    },
    series: [{ type: 'line', name: 'Altitude', color: HIGHLIGHT, lineWidth: 3, marker: { enabled: false }, data }]
  };
};

/** Altitude of the object from the noon of the date to the next noon */
export default function AltitudeChart({
  horizontalCoords,
  ngcInfo,
  nightInfo,
  minAltitude
}: {
  horizontalCoords: CoordSeries<Az>;
  ngcInfo: NgcInfo;
  nightInfo: NightInfo;
  minAltitude: Degrees;
}) {
  const options = useMemo(
    () => getOptions(horizontalCoords, ngcInfo, nightInfo, minAltitude),
    [horizontalCoords, ngcInfo, nightInfo, minAltitude]
  );
  return <Chart options={options} className="AltitudeChart" />;
}
