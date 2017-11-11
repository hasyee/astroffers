import React = require('react');
import moment = require('moment');
import { NightInfo } from '../calcs/types';

export default class extends React.PureComponent<{ nightInfo: NightInfo }> {
  render() {
    const { night, astroNight, moonNight, moonlessNight } = this.props.nightInfo;
    return (
      <div className="dynamic night card center">
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
    );
  }
}
