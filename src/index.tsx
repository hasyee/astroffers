import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import { registerSW } from 'virtual:pwa-register';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import App from './app/app';
import LocationProvider from './location/location.provider';
import ResultProvider from './result/result.provider';
import QueryStorage from './query/query.storage';
import { initQuery } from './query/query.utils';
import RouterProvider from './router/router.provider';
import theme from './theme/theme';
import VersionListener from './version/version.listener';
import './index.scss';

// the state of the app is in the query (date, location, order, filter), completed from the stored state
initQuery();

createRoot(document.getElementById('root')!).render(
  // MUI styles come first, so the stylesheets of the app override them at the same specificity
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <RouterProvider isQuerySticky>
        <LocationProvider>
          <ResultProvider>
            <App />
            <QueryStorage />
          </ResultProvider>
        </LocationProvider>
      </RouterProvider>
      <VersionListener />
    </ThemeProvider>
  </StyledEngineProvider>
);

registerSW({ immediate: true });
