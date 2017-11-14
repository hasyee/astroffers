import React = require('react');
import { connect } from 'react-redux';
import NightCard from './NightCard';
import List from './List';

class Result extends React.PureComponent<{ hasResult: boolean }> {
  render() {
    const { hasResult } = this.props;
    return (
      <div className="fitted column layout result">
        {hasResult && <NightCard />}
        {hasResult && <List />}
      </div>
    );
  }
}

export default connect(({ result }) => ({ hasResult: !!result }))(Result);
