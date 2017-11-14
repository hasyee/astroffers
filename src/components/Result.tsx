import React = require('react');
import NightCard from './NightCard';
import List from './List';

export default class Result extends React.PureComponent {
  render() {
    return (
      <div className="fitted column layout result">
        <NightCard />
        <List />
      </div>
    );
  }
}
