import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import CssBaseline from '@mui/material/CssBaseline';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import App from './app/app';
import DateProvider from './date/date.provider';
import LocationProvider from './location/location.provider';
import FilterProvider from './filter/filter.provider';
import ResultProvider from './result/result.provider';
import ListProvider from './list/list.provider';
import RouterProvider from './router/router.provider';
import theme from './theme/theme';
import VersionListener from './version/version.listener';
import './index.scss';

createRoot(document.getElementById('root')!).render(
  // MUI styles come first, so the stylesheets of the app override them at the same specificity
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <RouterProvider>
        <DateProvider>
          <LocationProvider>
            <FilterProvider>
              <ResultProvider>
                <ListProvider>
                  <App />
                </ListProvider>
              </ResultProvider>
            </FilterProvider>
          </LocationProvider>
        </DateProvider>
      </RouterProvider>
      <VersionListener />
    </ThemeProvider>
  </StyledEngineProvider>
);

registerSW({ immediate: true });
