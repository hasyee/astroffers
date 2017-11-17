import React = require('react');
import moment = require('moment');
import { connect } from 'react-redux';
import { NightInfo } from '../calcs/types';

class Summary extends React.PureComponent<{ nightInfo: NightInfo; count: number; isFiltering: boolean }> {
  render() {
    if (!this.props.nightInfo || this.props.isFiltering) return null;
    const { night, astroNight, moonNight, moonlessNight } = this.props.nightInfo;
    return (
      <div className="dynamic row layout summary card">
        <div className="dynamic column layout center count">
          <div>{this.props.count}</div>
          <div>total results</div>
        </div>
        <div className="fitted layout center">
          <table>
            <tbody>
              <tr>
                <td>Night</td>
                <td>Sunset</td>
                <td>{moment(night.start).format('HH:mm')}</td>
                <td>Sunrise</td>
                <td>{moment(night.end).format('HH:mm')}</td>
              </tr>
              <tr>
                <td>Astro night</td>
                <td>From</td>
                <td>{moment(astroNight.start).format('HH:mm')}</td>
                <td>To</td>
                <td>{moment(astroNight.end).format('HH:mm')}</td>
              </tr>
              <tr>
                <td>Moon</td>
                <td>Moonset</td>
                <td>{moment(moonNight.start).format('HH:mm')}</td>
                <td>Moonrise</td>
                <td>{moment(moonNight.end).format('HH:mm')}</td>
              </tr>
              <tr>
                <td>Moonless night</td>
                <td>From</td>
                <td>{moment(moonlessNight.start).format('HH:mm')}</td>
                <td>To</td>
                <td>{moment(moonlessNight.end).format('HH:mm')}</td>
              </tr>
            </tbody>
          </table>
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
