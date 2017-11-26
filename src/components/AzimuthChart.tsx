import React = require('react');
import ReactHighcharts = require('react-highcharts');
import HighchartsMore = require('highcharts/highcharts-more');
import { NightInfo, Interval, CoordSeries, Az } from '../calcs/types';
import { normalizeRad, radToDeg } from '../calcs/units';

HighchartsMore(ReactHighcharts.Highcharts);

const labelPlaceholders = Array.from({ length: 89 }).map(() => '');

export default class extends React.PureComponent<{ horizontalCoords: CoordSeries<Az> }> {
  render() {
    return <ReactHighcharts config={getConfig(this.props.horizontalCoords)} />;
  }
}

const getNightBands = (interval: Interval, color: string) => {
  if (!interval) return [];
  const { start, end } = interval;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const overhanging = startDate.getDay() !== endDate.getDay();
  const startHours = startDate.getHours() + startDate.getMinutes() / 60;
  const endHours = endDate.getHours() + endDate.getMinutes() / 60;
  const baseBands = overhanging
    ? [ { from: startHours, to: 24 }, { from: 0, to: endHours } ]
    : [ { from: startHours, to: endHours } ];
  return baseBands.map(b => ({ ...b, thickness: 50, color }));
};

const getConfig = (horizontalCoords: CoordSeries<Az>) => {
  /* const data = horizontalCoords
    .map(({ coord: { az, alt } }) => ({
      x: radToDeg(normalizeRad(az)),
      y: radToDeg(alt)
    }))
    .sort((a, b) => a.x - b.x); */
  const data = [
    { x: 0, y: 90 },
    { x: 90.1, y: 30 },
    { x: 91, y: 40 },
    { x: 92, y: 50 },
    { x: 180, y: 60 },
    { x: 270, y: 10 },
    { x: 359, y: 40 }
  ];
  console.log(data);
  return {
    plotOptions: {
      series: {
        turboThreshold: 1500
      },
      area: {
        lineWidth: 0,
        borderWidth: 0,
        states: {
          hover: {
            lineWidth: 0,
            borderWidth: 0
          }
        },
        marker: {
          enabled: false
        },
        threshold: null
      }
    },

    chart: {
      polar: true,
      height: 200,
      width: 200
    },

    title: {
      text: ''
    },

    pane: {
      startAngle: 0,
      endAngle: 360
    },

    legend: {
      enabled: false
    },

    exporting: {
      enabled: false
    },

    xAxis: {
      tickInterval: 90,
      min: 0,
      max: 360,
      categories: [ 'N', ...labelPlaceholders, 'E', ...labelPlaceholders, 'S', ...labelPlaceholders, 'W' ],
      labels: {
        step: 1,
        padding: 1,
        distance: 8
      }
    },

    yAxis: {
      min: 0,
      max: 90,
      labels: {
        enabled: false
      }
    },

    series: [
      {
        type: 'area',
        data,
        marker: { enabled: false }
      }
    ]
  };
};
