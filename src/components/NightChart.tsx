import React = require('react');
const { connect } = require('react-redux');
import ReactHighcharts = require('react-highcharts');
import { NightInfo, Interval, Timestamp, Hour } from '../calcs/types';
import { toNextDay, toMidnight, toNoon } from '../calcs/time';
import { getIntersection } from '../calcs/interval';
import { getNightInfo, getDate } from '../selectors';

type Band = { from: Hour; to: Hour; thickness: number; color: string };

export default connect(state => ({ nightInfo: getNightInfo(state), date: getDate(state) }))(
  class extends React.PureComponent<{ date: Timestamp; nightInfo: NightInfo }> {
    render() {
      if (!this.props.nightInfo) return null;
      return <ReactHighcharts config={getConfig(this.props.date, this.props.nightInfo)} />;
    }
  }
);

const getHalfDays = (date: Timestamp): [Interval, Interval] => [
  { start: toNoon(date), end: toMidnight(date) },
  { start: toMidnight(date), end: toNoon(toNextDay(date)) }
];

const getHoursOfTime = (time: Timestamp, toMidnight: boolean = false): Hour => {
  const date = new Date(time);
  const hours = date.getHours() + date.getMinutes() / 60;
  return toMidnight && hours === 0 ? 24 : hours;
};

const toBand = (interval: Interval, color: string): Band =>
  !interval
    ? null
    : {
        from: getHoursOfTime(interval.start),
        to: getHoursOfTime(interval.end, true),
        thickness: 50,
        color
      };

const getNightBands = (date: Timestamp, interval: Interval, color: string): Band[] => {
  if (!interval) return [];
  return getHalfDays(date).map(halfDay => toBand(getIntersection(halfDay, interval), color)).filter(_ => _);
};

const getConfig = (date: Timestamp, { night, moonlessNight, astroNight }: NightInfo) => ({
  chart: {
    polar: true,
    height: 150,
    width: 150
  },
  
  credits: {
    enabled: false
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
      ...getNightBands(date, night, '#01579B'),
      ...getNightBands(date, astroNight, 'grey'),
      ...getNightBands(date, moonlessNight, 'black')
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
