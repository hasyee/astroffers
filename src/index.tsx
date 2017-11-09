import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import store from './store';
import App from './components/App';

const theme = require('../theme.json');
const { version, description, author, license, bugs: { url: feedback }, homepage } = require('../package.json');

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
