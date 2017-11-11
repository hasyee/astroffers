import React = require('react');
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
              <td>{new Date(night.start).toLocaleString()}</td>
              <td>Sunrise</td>
              <td>{new Date(night.end).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Astro night</td>
              <td>From</td>
              <td>{new Date(astroNight.start).toLocaleString()}</td>
              <td>To</td>
              <td>{new Date(astroNight.end).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Moon</td>
              <td>Moonset</td>
              <td>{new Date(moonNight.start).toLocaleString()}</td>
              <td>Moonrise</td>
              <td>{new Date(moonNight.end).toLocaleString()}</td>
            </tr>
            <tr>
              <td>Moonless night</td>
              <td>From</td>
              <td>{new Date(moonlessNight.start).toLocaleString()}</td>
              <td>To</td>
              <td>{new Date(moonlessNight.end).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}
