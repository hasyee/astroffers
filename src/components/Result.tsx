import React = require('react');
import { connect } from 'react-redux';
import { NgcObject } from '../calcs/types';
import getNightInfo from '../calcs/getNightInfo';
import getObjects from '../calcs/getObjects';
const catalog: NgcObject[] = require('../../data/ngc.json');
import NightCard from './NightCard';
import List from './List';

class Result extends React.PureComponent<{
  date: number;
  latitude: number;
  longitude: number;
  twilight: number;
  altitude: number;
  magnitude: number;
}> {
  render() {
    const { date, latitude, longitude, twilight, altitude, magnitude } = this.props;
    const nightInfo = getNightInfo(date, latitude, longitude, twilight);
    const objects = getObjects(catalog, date, latitude, longitude, nightInfo.moonNight, altitude, magnitude);
    return (
      <div className="fitted column layout result">
        <NightCard nightInfo={nightInfo} />
        <List objects={objects} />
      </div>
    );
  }
}

export default connect(({ filter: { date, latitude, longitude, twilight, altitude, magnitude } }) => ({
  date,
  latitude,
  longitude,
  twilight,
  altitude,
  magnitude
}))(Result);
