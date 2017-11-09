import * as React from 'react';
import DatePicker from 'material-ui/DatePicker';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Filter from './Filter';
import SunCard from './SunCard';

export default class extends React.PureComponent<{
  version: string;
  description: string;
  author: string;
  license: string;
  feedback: string;
  homepage: string;
}> {
  state = {
    isAboutOpen: false
  };

  handleAboutOpen = () => this.setState({ isAboutOpen: true });
  handleAboutClose = () => this.setState({ isAboutOpen: false });

  renderAboutDialog() {
    const { version, description, author, license, feedback, homepage } = this.props;
    const actions = [ <FlatButton label="Close" primary={true} onClick={this.handleAboutClose} /> ];

    return (
      <Dialog
        title="About Astroffers"
        actions={actions}
        modal={false}
        open={this.state.isAboutOpen}
        onRequestClose={this.handleAboutClose}
        autoScrollBodyContent
      >
        <table className="about-table">
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
              <a href={feedback} target="_blank">
                {feedback}
              </a>
            </td>
          </tr>
          <tr>
            <td>
              <b>Homepage</b>
            </td>
            <td>
              <a href={homepage} target="_blank">
                {homepage}
              </a>
            </td>
          </tr>
        </table>
      </Dialog>
    );
  }

  renderMenu() {
    return (
      <IconMenu
        iconButtonElement={
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        }
        targetOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
      >
        <MenuItem primaryText="About" onClick={this.handleAboutOpen} />
      </IconMenu>
    );
  }

  render() {
    return (
      <div className="absolute column layout">
        <header className="dynamic">
          <AppBar title="Astroffers" showMenuIconButton={false} iconElementRight={this.renderMenu()} />
        </header>
        <main className="fitted layout">
          <div className="dynamic column layout high panel">
            <Filter />
          </div>
          <div className="fitted column layout overflow-y content">
            <SunCard />
          </div>
        </main>
        {this.renderAboutDialog()}
      </div>
    );
  }
}
