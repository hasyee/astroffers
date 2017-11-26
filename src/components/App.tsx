import * as React from 'react';
import DatePicker from 'material-ui/DatePicker';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import HelpIcon from 'material-ui/svg-icons/action/help';
import AboutIcon from 'material-ui/svg-icons/action/info';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Filter from './Filter';
import About from './About';
import Help from './Help';
import Result from './Result';

export default class extends React.PureComponent<{
  version: string;
  description: string;
  author: string;
  license: string;
  feedback: string;
  homepage: string;
}> {
  state = {
    isAboutOpen: false,
    isHelpOpen: false
  };

  handleAboutOpen = () => this.setState({ isAboutOpen: true });
  handleAboutClose = () => this.setState({ isAboutOpen: false });
  handleHelpOpen = () => this.setState({ isHelpOpen: true });
  handleHelpClose = () => this.setState({ isHelpOpen: false });

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
        <MenuItem primaryText="Help" leftIcon={<HelpIcon />} onClick={this.handleHelpOpen} />
        <MenuItem primaryText="About" leftIcon={<AboutIcon />} onClick={this.handleAboutOpen} />
      </IconMenu>
    );
  }

  render() {
    const { version, description, author, license, feedback, homepage } = this.props;
    return (
      <div className="absolute column layout">
        <header className="dynamic">
          <AppBar
            title="Astroffers"
            showMenuIconButton={false}
            iconElementRight={this.renderMenu()}
            titleStyle={{ fontWeight: '100', userSelect: 'none', cursor: 'default' }}
          />
        </header>
        <main className="fitted layout">
          <div className="dynamic column layout high panel">
            <Filter />
          </div>
          <div className="fitted column layout">
            <Result />
          </div>
        </main>
        <About
          isOpen={this.state.isAboutOpen}
          onClose={this.handleAboutClose}
          version={version}
          description={description}
          author={author}
          license={license}
          feedback={feedback}
          homepage={homepage}
        />
        <Help isOpen={this.state.isHelpOpen} onClose={this.handleHelpClose} />
      </div>
    );
  }
}
