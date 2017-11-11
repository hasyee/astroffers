import React = require('react');
import moment = require('moment');
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import getNightInfo from '../calcs/getNightInfo';

const iconStyle = {
  fontSize: '70px',
  color: '#ddd'
};

class SunCard extends React.PureComponent<{ date: number; latitude: number; longitude: number; twilight: number }> {
  render() {
    const { date, latitude, longitude, twilight } = this.props;
    const { night, astroNight, moonNight, moonlessNight } = getNightInfo(date, latitude, longitude, twilight);
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

export default connect(({ filter: { date, latitude, longitude, twilight } }) => ({
  date,
  latitude,
  longitude,
  twilight
}))(SunCard);
