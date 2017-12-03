import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import store from './store';
import App from './components/App';
import ReactHighcharts = require('react-highcharts');
import HighchartsMore = require('highcharts/highcharts-more');
import Nucleus = require('electron-nucleus');
import Analytics from 'electron-google-analytics';

Nucleus.init('5a1ee99ffd2a27796bfc934f');
const analytics = new Analytics('UA-110578592-1');

try {
  HighchartsMore(ReactHighcharts.Highcharts);

  const theme = require('../static/theme.json');
  const {
    version,
    description,
    author: { name: author },
    license,
    bugs: { url: feedback },
    homepage
  } = require('../package.json');

  ReactDOM.render(
    <Provider store={store as any}>
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <App
          version={version}
          description={description}
          author={author}
          license={license}
          feedback={feedback}
          homepage={homepage}
        />
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('app')
  );

  analytics
    .screen('astroffers', version, 'org.electron.astroffers', 'org.electron.astroffers', 'Window')
    .then(response => {
      return response;
    })
    .catch(err => {
      return err;
    });
} catch (err) {
  alert(err.message);
  throw err;
}
