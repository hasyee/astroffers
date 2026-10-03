import { useMemo } from 'react';
import type Highcharts from 'highcharts';
import moment from 'moment';
import type { Az, CoordSeries } from '../calculator/calculator.types';
import { normalizeRad, radToDeg } from '../calculator/calculator.units';
import Chart from '../chart/chart';
import { GRID, HIGHLIGHT } from '../chart/chart.colors';

const COMPASS: Record<number, string> = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };

type Point = { x: number; y: number | null; time: number };

const getOptions = (horizontalCoords: CoordSeries<Az>, size: number): Highcharts.Options => {
  // the distance from the center is the zenith distance; below the horizon the line breaks
  const data: Point[] = horizontalCoords.map(({ time, coord: { az, alt } }) => ({
    x: radToDeg(normalizeRad(az)),
    y: alt > 0 ? 90 - radToDeg(alt) : null,
    time
  }));
  return {
    // fixed margins leave room for the compass labels, which would be ellipsized at the sides otherwise
    chart: { polar: true, height: size, width: size, margin: [24, 24, 24, 24] },
    pane: {
      startAngle: 0,
      endAngle: 360,
      background: [{ backgroundColor: 'rgba(0, 0, 0, 0.3)', borderColor: GRID }]
    },
    tooltip: {
      formatter() {
        const { time } = this as unknown as Point;
        return `${moment(time).format('HH:mm')} – Az: ${Math.round(Number(this.x))}° Alt: ${Math.round(90 - Number(this.y))}°`;
      }
    },
    xAxis: {
      min: 0,
      max: 360,
      tickInterval: 90,
      labels: {
        style: { textOverflow: 'none', whiteSpace: 'nowrap' },
        formatter() {
          return COMPASS[Math.round(Number(this.value))] ?? '';
        }
      }
    },
    yAxis: { min: 0, max: 90, tickInterval: 30, labels: { enabled: false } },
    plotOptions: { series: { connectNulls: false } },
    series: [{ type: 'line', name: 'Path', color: HIGHLIGHT, lineWidth: 2, marker: { enabled: false }, data }]
  };
};

/** Path of the object on the sky above the horizon: azimuth around, zenith distance from the center */
export default function AzimuthChart({
  horizontalCoords,
  size = 220
}: {
  horizontalCoords: CoordSeries<Az>;
  size?: number;
}) {
  const options = useMemo(() => getOptions(horizontalCoords, size), [horizontalCoords, size]);
  return <Chart options={options} className="AzimuthChart" />;
}
