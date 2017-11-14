import React = require('react');
import { connect } from 'react-redux';
import CircularProgress from 'material-ui/CircularProgress';
import NightCard from './NightCard';
import List from './List';

class Result extends React.PureComponent<{ hasResult: boolean; isFiltering: boolean }> {
  render() {
    const { hasResult, isFiltering } = this.props;
    return (
      <div className="fitted column layout result center">
        {isFiltering && <CircularProgress />}
        {!isFiltering && hasResult && <NightCard />}
        {!isFiltering && hasResult && <List />}
      </div>
    );
  }
}

export default connect(({ result, isFiltering }) => ({ hasResult: !!result, isFiltering }))(Result);
