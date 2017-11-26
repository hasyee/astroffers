import React = require('react');
import ReactMarkdown = require('react-markdown');
import { readFileSync } from 'fs';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';

export default class extends React.PureComponent<{
  isOpen: boolean;
  onClose: Function;
}> {
  render() {
    const md = readFileSync('help.md').toString();
    const { isOpen, onClose } = this.props;
    const actions = [ <FlatButton label="Close" primary={true} onClick={onClose} /> ];
    return (
      <Dialog title="Help" actions={actions} modal={false} open={isOpen} onRequestClose={onClose} autoScrollBodyContent>
        <ReactMarkdown source={md} />
      </Dialog>
    );
  }
}
