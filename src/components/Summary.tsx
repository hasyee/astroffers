import React = require('react');
import moment = require('moment');
import { connect } from 'react-redux';
import { NightInfo } from '../calcs/types';
import Moon from './Moon';
import NightChart from './NightChart';

class Summary extends React.PureComponent<{ nightInfo: NightInfo; count: number; isFiltering: boolean }> {
  render() {
    if (!this.props.nightInfo || this.props.isFiltering) return null;
    const { night, astroNight, moonNight, moonlessNight, moonPhase } = this.props.nightInfo;
    return (
      <div className="dynamic row layout summary card">
        <div className="dynamic column layout center count">
          <div>{this.props.count}</div>
          <div>total results</div>
        </div>
        <div className="dynamic layout center">
          <Moon phase={moonPhase} />
        </div>
        <div className="fitted layout center">
          <table>
            <tbody>
              <tr>
                <td>
                  <i className="mdi mdi-brightness-1" style={{ color: '#5c6bc0' }} /> Night
                </td>
                <td>Sunset</td>
                <td>{moment(night.start).format('HH:mm')}</td>
                <td>Sunrise</td>
                <td>{moment(night.end).format('HH:mm')}</td>
              </tr>
              <tr>
                <td>
                  <i className="mdi mdi-brightness-1" style={{ color: 'grey' }} /> Astro night
                </td>
                <td>From</td>
                <td>{moment(astroNight.start).format('HH:mm')}</td>
                <td>To</td>
                <td>{moment(astroNight.end).format('HH:mm')}</td>
              </tr>
              <tr>
                <td>
                  <i className="mdi mdi-brightness-1" style={{ color: 'transparent' }} /> Moon
                </td>
                <td>Moonset</td>
                <td>{moonNight ? moment(moonNight.start).format('HH:mm') : '-'}</td>
                <td>Moonrise</td>
                <td>{moonNight ? moment(moonNight.end).format('HH:mm') : '-'}</td>
              </tr>
              <tr>
                <td>
                  <i className="mdi mdi-brightness-1" style={{ color: 'black' }} /> Moonless night
                </td>
                <td>From</td>
                <td>{moonlessNight ? moment(moonlessNight.start).format('HH:mm') : '-'}</td>
                <td>To</td>
                <td>{moonlessNight ? moment(moonlessNight.end).format('HH:mm') : '-'}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="dynamic layout center night">
          <NightChart nightInfo={this.props.nightInfo} />
        </div>
      </div>
    );
  }
}

export default connect(({ result, isFiltering }) => ({
  isFiltering,
  nightInfo: result ? result.nightInfo : null,
  count: result ? result.list.length : 0
}))(Summary);
