import * as React from 'react';
import DatePicker from 'material-ui/DatePicker';
import AppBar from 'material-ui/AppBar';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Filter from './Filter';
import About from './About';
import Help from './Help';
import Result from './Result';
import analytics from '../analytics';

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

  handleAboutOpen = () => {
    this.setState({ isAboutOpen: true });
    analytics.event('About', 'open');
  };
  handleAboutClose = () => {
    this.setState({ isAboutOpen: false });
    analytics.event('About', 'close');
  };
  handleHelpOpen = () => {
    this.setState({ isHelpOpen: true });
    analytics.event('Help', 'open');
  };
  handleHelpClose = () => {
    this.setState({ isHelpOpen: false });
    analytics.event('Help', 'close');
  };

  componentDidMount() {
    analytics.screen('astroffers', this.props.version, 'org.electron.astroffers', 'org.electron.astroffers', 'App');
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
        <MenuItem primaryText="Help" onClick={this.handleHelpOpen} />
        <MenuItem primaryText="About" onClick={this.handleAboutOpen} />
      </IconMenu>
    );
  }

  render() {
    const { version, description, author, license, feedback, homepage } = this.props;
    return (
      <div className="absolute column layout">
        <header className="dynamic">
          <AppBar
            title={
              <div>
                <img src="static/icons/icon_transparent_white.png" />
                <span>Astroffers</span>
              </div>
            }
            showMenuIconButton={false}
            iconElementRight={this.renderMenu()}
            titleStyle={{ fontWeight: '100', userSelect: 'none', cursor: 'default' }}
          />
        </header>
        <main className="fitted layout">
          <div className="dynamic column layout high panel">
            <Filter />
          </div>
          <div className="fitted column layout overflow-x">
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
