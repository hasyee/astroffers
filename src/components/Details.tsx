import React = require('react');
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { shell } from 'electron';
import { NgcInfo } from '../calcs/types';
import { closeDetails } from '../actions';

class Details extends React.PureComponent<{
  isOpen: boolean;
  ngcInfo: NgcInfo;
  closeDetails: typeof closeDetails;
}> {
  render() {
    if (!this.props.ngcInfo) return null;
    const { closeDetails, isOpen, ngcInfo: { object: { ngc } } } = this.props;
    const actions = [ <FlatButton label="Close" primary={true} onClick={closeDetails} /> ];
    return (
      <Dialog
        title={`NGC ${ngc}`}
        actions={actions}
        modal={true}
        open={isOpen}
        onRequestClose={closeDetails}
        autoScrollBodyContent
      >
        ...
      </Dialog>
    );
  }
}

export default connect(
  ({ openedDetails, result }) => ({
    isOpen: openedDetails !== null,
    ngcInfo: result ? result.list.find(info => info.object.ngc === openedDetails) : null
  }),
  { closeDetails }
)(Details);
