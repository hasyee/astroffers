import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './app/app';
import DateProvider from './date/date.provider';
import LocationProvider from './location/location.provider';
import FilterProvider from './filter/filter.provider';
import ResultProvider from './result/result.provider';
import ListProvider from './list/list.provider';
import DetailsProvider from './details/details.provider';
import VersionListener from './version/version.listener';
import './index.scss';

createRoot(document.getElementById('root')!).render(
  <>
    <DateProvider>
      <LocationProvider>
        <FilterProvider>
          <ResultProvider>
            <ListProvider>
              <DetailsProvider>
                <App />
              </DetailsProvider>
            </ListProvider>
          </ResultProvider>
        </FilterProvider>
      </LocationProvider>
    </DateProvider>
    <VersionListener />
  </>
);

registerSW({ immediate: true });
