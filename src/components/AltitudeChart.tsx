import React = require('react');
import ReactHighcharts = require('react-highcharts');
import HighchartsMore = require('highcharts-more');
import moment = require('moment');
import { NgcInfo, NightInfo, Interval, Az, CoordSeries } from '../calcs/types';
import { radToDeg } from '../calcs/units';
import { toNextDay } from '../calcs/time';
import { getCiphers } from 'crypto';

HighchartsMore(ReactHighcharts.Highcharts);

export default class extends React.PureComponent<{
  minAltitude: number;
  ngcInfo: NgcInfo;
  nightInfo: NightInfo;
  horizontalCoords: CoordSeries<Az>;
}> {
  render() {
    return (
      <ReactHighcharts
        config={getConfig(
          this.props.horizontalCoords,
          this.props.ngcInfo,
          this.props.nightInfo,
          this.props.minAltitude
        )}
      />
    );
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

const getConfig = (
  horizontalCoords: CoordSeries<Az>,
  { transit, max }: NgcInfo,
  { night, moonlessNight, astroNight }: NightInfo,
  minAltitude: number
) => {
  const data = horizontalCoords.map(({ time, coord: { alt } }) => ({ x: time, y: radToDeg(alt) }));
  return {
    plotOptions: {
      series: {
        turboThreshold: 1500
      }
    },

    chart: {
      height: '200px'
    },

    title: {
      text: ''
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
        return `${moment(this.x).format('HH:mm')} - ${Math.round(this.y)}°`;
      }
    },

    xAxis: {
      tickInterval: 1000 * 3600 * 2,

      labels: {
        formatter: function() {
          return moment(this.value).format('HH:mm');
        }
      },

      plotBands: [
        {
          from: data[0].x,
          to: data[data.length - 1].x,
          color: 'lightblue'
        },
        night
          ? {
              from: night.start,
              to: night.end,
              color: '#01579B'
            }
          : {},
        astroNight
          ? {
              from: astroNight.start,
              to: astroNight.end,
              color: 'grey'
            }
          : {},
        moonlessNight
          ? {
              from: moonlessNight.start,
              to: moonlessNight.end,
              color: 'black'
            }
          : {}
      ],

      plotLines: [
        Math.abs(transit - max) > 3600 * 1000
          ? {
              value: transit < data[0].x ? toNextDay(transit) : transit,
              zIndex: 5,
              width: 1,
              color: 'white',
              label: {
                text: 'Transit',
                style: {
                  color: 'white'
                }
              }
            }
          : {},
        {
          value: max,
          zIndex: 5,
          width: 1,
          color: 'white',
          label: {
            text: 'Best visibility',
            style: {
              color: 'white',
              fontWeight: 'bold'
            }
          }
        }
      ]
    },

    yAxis: {
      title: {
        text: 'Altitude °'
      },

      plotLines: [
        {
          value: minAltitude,
          zIndex: 5,
          width: 2,
          dashStyle: 'dash',
          color: 'white'
        }
      ]
    },

    series: [
      {
        name: 'Altitude',
        color: '#2196F3',
        lineWidth: 3,
        data
      }
    ]
  };
};
