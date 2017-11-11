import React = require('react');
import moment = require('moment');
import { connect } from 'react-redux';
import FontIcon from 'material-ui/FontIcon';
import { getNight } from '../calcs/sun';
import { getMoonNight } from '../calcs/moon';
import { getLocation } from '../calcs/units';

const iconStyle = {
  fontSize: '70px',
  color: '#ddd'
};

class MoonCard extends React.PureComponent<{ date: number; latitude: number; longitude: number }> {
  render() {
    const { date, latitude, longitude } = this.props;
    const night = getNight(date, getLocation(latitude, longitude));
    const { start, end } = getMoonNight(night, getLocation(latitude, longitude));
    return (
      <div className="dynamic row layout half-day-arc card center">
        <div className="center layout">
          <FontIcon className="mdi mdi-brightness-2" style={iconStyle} />
        </div>
        <div className="fitted column layout">
          <div className="center layout">Moonset</div>
          <div className="center layout">{moment(start).format('HH:mm')}</div>
        </div>
        <div className="fitted column layout">
          <div className="center layout">Moonrise</div>
          <div className="center layout">{moment(end).format('HH:mm')}</div>
        </div>
      </div>
    );
  }
}

export default connect(({ filter: { date, latitude, longitude } }) => ({ date, latitude, longitude }))(MoonCard);
