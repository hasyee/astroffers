import { useCallback, useState } from 'react';
import { Drawer } from '@blueprintjs/core';
import Details from '../details/details';
import Filter from '../filter/filter';
import Header from '../header/header';
import { useCloseOnBack } from '../history/history.hooks';
import List from '../list/list';
import { useIsWideScreen } from '../media/media.hooks';
import { useCalculation } from '../result/result.hooks';
import Summary from '../summary/summary';
import './app.scss';

function WideLayout() {
  return (
    <div className="App wide">
      <Header />
      <main>
        <aside>
          <Filter />
        </aside>
        <section>
          <Summary />
          <div className="list-card">
            <List />
          </div>
        </section>
      </main>
      <Details />
    </div>
  );
}

function CompactLayout() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const handleOpenFilter = useCallback(() => setIsFilterOpen(true), []);
  const handleCloseFilter = useCallback(() => setIsFilterOpen(false), []);
  useCloseOnBack(isFilterOpen, handleCloseFilter);

  return (
    <div className="App compact">
      <Header onOpenFilter={handleOpenFilter} />
      <main>
        <Summary compact />
        <List compact />
      </main>
      <Drawer
        isOpen={isFilterOpen}
        onClose={handleCloseFilter}
        position="left"
        size="min(340px, 90vw)"
        title="Filter"
        icon="filter"
        className="FilterDrawer"
      >
        <Filter />
      </Drawer>
      <Details />
    </div>
  );
}

export default function App() {
  useCalculation();
  const isWideScreen = useIsWideScreen();

  return isWideScreen ? <WideLayout /> : <CompactLayout />;
}
