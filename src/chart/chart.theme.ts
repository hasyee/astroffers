import Highcharts from 'highcharts';
import 'highcharts/highcharts-more';
import { GRID, SURFACE, TEXT, TEXT_MUTED } from './chart.colors';

const axis: Highcharts.XAxisOptions & Highcharts.YAxisOptions = {
  lineColor: GRID,
  tickColor: GRID,
  gridLineColor: GRID,
  labels: { style: { color: TEXT_MUTED } },
  title: { style: { color: TEXT_MUTED } }
};

Highcharts.setOptions({
  time: { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone },
  chart: { backgroundColor: 'transparent', animation: false, style: { fontFamily: 'inherit' } },
  title: { text: undefined },
  credits: { enabled: false },
  legend: { enabled: false },
  exporting: { enabled: false },
  accessibility: { enabled: false },
  tooltip: { backgroundColor: SURFACE, borderWidth: 0, style: { color: TEXT } },
  plotOptions: { series: { animation: false } },
  xAxis: axis,
  yAxis: axis
});

export default Highcharts;
