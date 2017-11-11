import React = require('react');
import moment = require('moment');
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import { getNight } from '../calcs/sun';
import { getMoonNight } from '../calcs/moon';
import { getLocation, degToRad } from '../calcs/units';

const sunIconStyle = {
  fontSize: '70px',
  color: '#ddd'
};

const moonIconStyle = {
  fontSize: '70px',
  color: '#ddd'
};

class SunCard extends React.PureComponent<{ date: number; latitude: number; longitude: number; twilight: number }> {
  render() {
    const { date, latitude, longitude, twilight } = this.props;
    const location = getLocation(latitude, longitude);
    const night = getNight(date, location, degToRad(twilight));
    const { start: moonset, end: moonrise } = getMoonNight(night, location);
    return (
      <div className="dynamic row layout sun card center">
        <div className="center layout">
          <FontIcon className="mdi mdi-theme-light-dark" style={sunIconStyle} />
        </div>
        <div className="fitted column layout date-time">
          <div className="center layout">Start of night</div>
          <div className="center layout">{moment(night.start).format('HH:mm')}</div>
          <div className="center layout">{moment(night.start).format('YYYY-MM-DD')}</div>
        </div>
        <div className="fitted column layout date-time">
          <div className="center layout">End of night</div>
          <div className="center layout">{moment(night.end).format('HH:mm')}</div>
          <div className="center layout">{moment(night.end).format('YYYY-MM-DD')}</div>
        </div>
        <div className="center layout">
          <FontIcon className="mdi mdi-brightness-2" style={moonIconStyle} />
        </div>
        <div className="fitted column layout date-time">
          <div className="center layout">Moonset</div>
          <div className="center layout">{moment(moonset).format('HH:mm')}</div>
          <div className="center layout">{moment(moonset).format('YYYY-MM-DD')}</div>
        </div>
        <div className="fitted column layout date-time">
          <div className="center layout">Moonrise</div>
          <div className="center layout">{moment(moonrise).format('HH:mm')}</div>
          <div className="center layout">{moment(moonrise).format('YYYY-MM-DD')}</div>
        </div>
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
