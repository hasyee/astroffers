import React = require('react');
import { connect } from 'react-redux';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import { shell } from 'electron';
import { AppInfo } from '../types';

export default connect(({ appInfo }: any) => ({ appInfo }))(
  class extends React.PureComponent<{
    isOpen: boolean;
    onClose: Function;
    appInfo: AppInfo;
  }> {
    render() {
      const { isOpen, onClose, appInfo: { version, description, author, license, feedback, homepage } } = this.props;
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
          <div className="row layout about">
            <img src="static/icons/icon.png" className="logo" />
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
          </div>
        </Dialog>
      );
    }
  }
);
