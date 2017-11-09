import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import store from './store';
import App from './components/App';

const theme = {
  palette: {
    primary1Color: '#ffeb3b',
    accent1Color: '#ff5252',
    accent3Color: '#ff8a80',
    accent2Color: '#ff1744'
  }
};

ReactDOM.render(
  <Provider store={store as any}>
    <MuiThemeProvider muiTheme={getMuiTheme(darkBaseTheme, theme)}>
      <App />
    </MuiThemeProvider>
  </Provider>,
  document.getElementById('app')
);
