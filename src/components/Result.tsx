import React = require('react');
import { connect } from 'react-redux';
import NightCard from './NightCard';
import getNightInfo from '../calcs/getNightInfo';

class Result extends React.PureComponent<{
  date: number;
  latitude: number;
  longitude: number;
  twilight: number;
}> {
  render() {
    const { date, latitude, longitude, twilight } = this.props;
    const nightInfo = getNightInfo(date, latitude, longitude, twilight);
    return (
      <div className="fitted column layout overflow-y result">
        <NightCard nightInfo={nightInfo} />
      </div>
    );
  }
}

export default connect(({ filter: { date, latitude, longitude, twilight } }) => ({
  date,
  latitude,
  longitude,
  twilight
}))(Result);
