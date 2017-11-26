import React = require('react');
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { shell } from 'electron';

export default class extends React.PureComponent<{
  isOpen: boolean;
  version: string;
  description: string;
  author: string;
  license: string;
  feedback: string;
  homepage: string;
  onClose: Function;
}> {
  render() {
    const { isOpen, version, description, author, license, feedback, homepage, onClose } = this.props;
    const actions = [ <FlatButton label="Close" primary={true} onClick={onClose} /> ];
    return (
      <Dialog
        title="About Astroffers"
        actions={actions}
        modal={false}
        open={isOpen}
        onRequestClose={onClose}
        autoScrollBodyContent
      >
        <table className="about-table">
          <tbody>
            <tr>
              <td>
                <b>Version</b>
              </td>
              <td>{version}</td>
            </tr>
            <tr>
              <td>
                <b>Author</b>
              </td>
              <td>{author}</td>
            </tr>
            <tr>
              <td>
                <b>License</b>
              </td>
              <td>{license}</td>
            </tr>
            <tr>
              <td>
                <b>Feedback</b>
              </td>
              <td>
                <a onClick={() => shell.openExternal(feedback)}>{feedback}</a>
              </td>
            </tr>
            <tr>
              <td>
                <b>Homepage</b>
              </td>
              <td>
                <a onClick={() => shell.openExternal(homepage)}>{homepage}</a>
              </td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    );
  }
}
