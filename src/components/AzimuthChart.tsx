import React = require('react');
import { findDOMNode } from 'react-dom';
import moment = require('moment');
import ReactHighcharts = require('react-highcharts');
import { NightInfo, Interval, CoordSeries, Az } from '../calcs/types';
import { normalizeRad, radToDeg } from '../calcs/units';

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
  const data = horizontalCoords
    .map(({ time, coord: { az, alt } }) => ({
      x: radToDeg(normalizeRad(az)),
      y: alt > 0 ? 90 - radToDeg(alt) : null,
      time
    }))
    .sort((a, b) => a.time - b.time);

  return {
    plotOptions: {
      series: {
        turboThreshold: 1500
      }
    },

    chart: {
      polar: true,
      height: 200,
      width: 200
    },

    credits: {
      enabled: false
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

    tooltip: {
      borderWidth: 0,
      formatter: function() {
        return `${moment(this.point.time).format('HH:mm')} - Az: ${Math.round(this.x)}° Alt: ${Math.round(
          90 - this.y
        )}°`;
      }
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
        type: 'line',
        data,
        marker: { enabled: false }
      }
    ]
  };
};
