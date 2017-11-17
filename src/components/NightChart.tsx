import React = require('react');
import ReactHighcharts = require('react-highcharts');
import HighchartsMore = require('highcharts-more');
HighchartsMore(ReactHighcharts.Highcharts);
import { NightInfo } from '../calcs/types';
import { getCiphers } from 'crypto';

export default class extends React.PureComponent<{ nightInfo: NightInfo }> {
  render() {
    return <ReactHighcharts config={getConfig()} />;
  }
}

const getConfig = () => ({
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
    tickInterval: 1,
    tickWidth: 0,
    tickColor: 'transparent',
    min: 0,
    max: 24,
    labels: {
      step: 6,
      padding: 1,
      distance: 8
    },
    plotBands: [
      {
        thickness: 50,
        color: 'rgb(92, 107, 192)', // Color value
        from: 7, // Start of the plot band
        to: 12 // End of the plot band
      },
      {
        thickness: 50,
        color: 'rgb(92, 107, 192)', // Color value
        from: 0, // Start of the plot band
        to: 4 // End of the plot band
      },
      {
        thickness: 50,
        color: 'black', // Color value
        from: 9, // Start of the plot band
        to: 12 // End of the plot band,
      },
      {
        thickness: 50,
        color: 'black', // Color value
        from: 0, // Start of the plot band
        to: 3 // End of the plot band
      },
      {
        thickness: 50,
        color: 'grey', // Color value
        from: 8, // Start of the plot band
        to: 11.3 // End of the plot band
      },
      {
        thickness: 50,
        color: 'grey', // Color value
        from: 0, // Start of the plot band
        to: 0 // End of the plot band
      }
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
