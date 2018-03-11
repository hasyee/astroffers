import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import store from './store';
import App from './components/App';
import ReactHighcharts = require('react-highcharts');
import HighchartsMore = require('highcharts/highcharts-more');
const theme = require('../static/theme.json');

HighchartsMore(ReactHighcharts.Highcharts);

try {
  ReactDOM.render(
    <Provider store={store as any}>
      <MuiThemeProvider muiTheme={getMuiTheme(theme)}>
        <App />
      </MuiThemeProvider>
    </Provider>,
    document.getElementById('app')
  );
} catch (err) {
  alert(err.message);
  throw err;
}
