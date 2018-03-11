import React = require('react');
import moment = require('moment');
const { connect } = require('react-redux');
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import { NightInfo, NgcInfo } from '../calcs/types';
import { exportToCsv } from '../actions';
import { isFiltering, getNightInfo, getCount, getList } from '../selectors';
import Moon from './Moon';
import NightChart from './NightChart';

export default connect(
  state => ({
    list: getList(state),
    isFiltering: isFiltering(state),
    nightInfo: getNightInfo(state),
    count: getCount(state)
  }),
  { exportToCsv }
)(
  class extends React.PureComponent<{
    list: NgcInfo[];
    nightInfo: NightInfo;
    count: number;
    isFiltering: boolean;
    exportToCsv: typeof exportToCsv;
  }> {
    render() {
      if (!this.props.nightInfo || this.props.isFiltering) return null;
      const { night, astroNight, moonNight, moonlessNight, moonPhase } = this.props.nightInfo;
      return (
        <div className="dynamic row layout summary card">
          <div className="dynamic column layout center count">
            <div>{this.props.count}</div>
            <div>total results</div>
            <div style={{ marginTop: '10px' }}>
              <FlatButton
                primary
                icon={<FontIcon className="mdi mdi-file-export" />}
                label="EXPORT"
                onClick={this.props.exportToCsv}
                disabled={!this.props.list || this.props.list.length === 0}
              />
            </div>
          </div>
          <div className="dynamic layout center">
            <Moon phase={moonPhase} />
          </div>
          <div className="fitted layout center">
            <table>
              <tbody>
                <tr>
                  <td>
                    <i className="mdi mdi-brightness-1" style={{ color: '#01579B' }} /> Night
                  </td>
                  <td>Sunset</td>
                  <td>{night && Number.isFinite(night.start) ? moment(night.start).format('HH:mm') : '-'}</td>
                  <td>Sunrise</td>
                  <td>{night && Number.isFinite(night.end) ? moment(night.end).format('HH:mm') : '-'}</td>
                </tr>
                <tr>
                  <td>
                    <i className="mdi mdi-brightness-1" style={{ color: 'transparent' }} /> Astro night
                  </td>
                  <td>From</td>
                  <td>
                    {astroNight && Number.isFinite(astroNight.start) ? moment(astroNight.start).format('HH:mm') : '-'}
                  </td>
                  <td>To</td>
                  <td>
                    {astroNight && Number.isFinite(astroNight.end) ? moment(astroNight.end).format('HH:mm') : '-'}
                  </td>
                </tr>
                <tr>
                  <td>
                    <i className="mdi mdi-brightness-1" style={{ color: 'grey' }} /> Moon
                  </td>
                  <td>Moonset</td>
                  <td>
                    {moonNight && Number.isFinite(moonNight.start) ? moment(moonNight.start).format('HH:mm') : '-'}
                  </td>
                  <td>Moonrise</td>
                  <td>{moonNight && Number.isFinite(moonNight.end) ? moment(moonNight.end).format('HH:mm') : '-'}</td>
                </tr>
                <tr>
                  <td>
                    <i className="mdi mdi-brightness-1" style={{ color: 'black' }} /> Moonless night
                  </td>
                  <td>From</td>
                  <td>
                    {moonlessNight && Number.isFinite(moonlessNight.start) ? (
                      moment(moonlessNight.start).format('HH:mm')
                    ) : (
                      '-'
                    )}
                  </td>
                  <td>To</td>
                  <td>
                    {moonlessNight && Number.isFinite(moonlessNight.end) ? (
                      moment(moonlessNight.end).format('HH:mm')
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="dynamic layout center night">
            <NightChart />
          </div>
        </div>
      );
    }
  }
);
