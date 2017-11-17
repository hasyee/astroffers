import React = require('react');
import { connect } from 'react-redux';
import classnames = require('classnames');
import CircularProgress from 'material-ui/CircularProgress';
import Summary from './Summary';
import List from './List';

class Result extends React.PureComponent<{ hasResult: boolean; isFiltering: boolean }> {
  render() {
    const { hasResult, isFiltering } = this.props;
    return (
      <div className={classnames('fitted column layout result', isFiltering && 'center')}>
        {isFiltering && <CircularProgress />}
        <Summary />
        <List />
      </div>
    );
  }
}

export default connect(({ result, isFiltering }) => ({ hasResult: !!result, isFiltering }))(Result);
