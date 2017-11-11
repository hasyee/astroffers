import React = require('react');
import moment = require('moment');
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import { getHalfDayArcOfSun } from '../calcs/sun';
import { getLocation } from '../calcs/units';

const iconStyle = {
  fontSize: '70px',
  color: '#ffeb3b'
};

class SunCard extends React.PureComponent<{ date: number; latitude: number; longitude: number }> {
  render() {
    const { date, latitude, longitude } = this.props;
    const { start, end } = getHalfDayArcOfSun(date, getLocation(latitude, longitude));
    return (
      <div className="dynamic row layout half-day-arc card center">
        <div className="center layout">
          <FontIcon className="mdi mdi-white-balance-sunny" style={iconStyle} />
        </div>
        <div className="fitted column layout">
          <div className="center layout">Sunrise</div>
          <div className="center layout">{moment(start).format('HH:mm')}</div>
        </div>
        <div className="fitted column layout">
          <div className="center layout">Sunset</div>
          <div className="center layout">{moment(end).format('HH:mm')}</div>
        </div>
      </div>
    );
  }
}

export default connect(({ filter: { date, latitude, longitude } }) => ({ date, latitude, longitude }))(SunCard);
