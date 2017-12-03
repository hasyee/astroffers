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
import analytics from './analytics';
const theme = require('../static/theme.json');

Nucleus.init('5a1ee99ffd2a27796bfc934f');
HighchartsMore(ReactHighcharts.Highcharts);

try {
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
} catch (err) {
  alert(err.message);
  analytics.event('Error', 'catched', { evLabel: err.message });
  throw err;
}
