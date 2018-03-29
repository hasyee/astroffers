import React = require('react');
const { connect } = require('react-redux');
import classnames = require('classnames');
import CircularProgress from 'material-ui/CircularProgress';
import { hasResult, isFiltering } from '../selectors';
import Summary from './Summary';
import List from './List';
import Details from './Details';

export default connect(state => ({ isFiltering: isFiltering(state) }))(
  class extends React.PureComponent<{ hasResult: boolean; isFiltering: boolean }> {
    render() {
      const { isFiltering } = this.props;
      return (
        <div className={classnames('fitted column layout result', isFiltering && 'center')}>
          {isFiltering && <CircularProgress />}
          <Summary />
          <List />
          <Details />
        </div>
      );
    }
  }
);
