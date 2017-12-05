import React = require('react');
import ReactHighcharts = require('react-highcharts');
import { NightInfo, Interval } from '../calcs/types';

export default class extends React.PureComponent<{ nightInfo: NightInfo }> {
  render() {
    return <ReactHighcharts config={getConfig(this.props.nightInfo)} />;
  }
}

const getNightBands = (interval: Interval, color: string) => {
  if (!interval) return [];
  const { start, end } = interval;
  if (start === -Infinity && end === Infinity) return [ { from: 0, to: 24, thickness: 50, color } ];
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

const getConfig = ({ night, moonlessNight, astroNight }: NightInfo) => ({
  chart: {
    polar: true,
    height: 150,
    width: 150
  },

  title: {
    text: ''
  },

  pane: {
    startAngle: 0,
    endAngle: 360,
    size: '80%'
  },

  legend: {
    enabled: false
  },

  exporting: {
    enabled: false
  },

  xAxis: {
    tickInterval: 6,
    min: 0,
    max: 24,
    labels: {
      step: 1,
      padding: 1,
      distance: 8
    },
    plotBands: [
      { from: 0, to: 24, thickness: 50, color: 'lightblue' },
      ...getNightBands(night, '#01579B'),
      ...getNightBands(astroNight, 'grey'),
      ...getNightBands(moonlessNight, 'black')
    ]
  },

  yAxis: {
    labels: {
      enabled: false
    }
  },

  series: [
    {
      type: 'line',
      data: [ {} ]
    }
  ]
});
