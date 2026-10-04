import { useCallback, useState } from 'react';
import classnames from 'classnames';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Details from '../details/details';
import Filter from '../filter/filter';
import Header from '../header/header';
import { useCloseOnBack } from '../history/history.hooks';
import List from '../list/list';
import { useHasFilterPanel, useIsWideScreen } from '../media/media.hooks';
import { useCalculation } from '../result/result.hooks';
import Summary from '../summary/summary';
import './app.scss';

/** The filter in a drawer from the left, closed by default; the back button closes it */
function FilterDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  useCloseOnBack(isOpen, onClose);

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={onClose}
      className="FilterDrawer"
      slotProps={{ paper: { className: 'FilterDrawerPaper' } }}
    >
      <div className="header">
        <Typography variant="h6" component="h2">
          Filter
        </Typography>
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </div>
      <Filter />
    </Drawer>
  );
}

/**
 * Filter panel and table. The filter panel is open by default, the menu button of the header closes and opens it;
 * below `FILTER_PANEL_QUERY` there is no room for it beside the summary, so the filter is in a drawer instead.
 */
function WideLayout() {
  const hasFilterPanel = useHasFilterPanel();
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const handleToggleFilter = useCallback(() => setIsPanelOpen(isOpen => !isOpen), []);
  const handleOpenDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const handleCloseDrawer = useCallback(() => setIsDrawerOpen(false), []);
  // the drawer closes when the window grows wide enough for the panel, and does not open again by shrinking
  if (hasFilterPanel && isDrawerOpen) setIsDrawerOpen(false);

  return (
    <div className="App wide">
      <Header onMenuClick={hasFilterPanel ? handleToggleFilter : handleOpenDrawer} />
      <main>
        {hasFilterPanel && (
          <aside className={classnames({ closed: !isPanelOpen })} inert={!isPanelOpen}>
            <Filter />
          </aside>
        )}
        <section>
          <Summary />
          <div className="list-card">
            <List />
          </div>
        </section>
      </main>
      <FilterDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
      <Details />
    </div>
  );
}

/** Summary bar, cards and the filter in a drawer */
function CompactLayout() {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const handleOpenFilter = useCallback(() => setIsFilterOpen(true), []);
  const handleCloseFilter = useCallback(() => setIsFilterOpen(false), []);

  return (
    <div className="App compact">
      <Header onMenuClick={handleOpenFilter} />
      <main>
        <Summary compact />
        <List compact />
      </main>
      <FilterDrawer isOpen={isFilterOpen} onClose={handleCloseFilter} />
      <Details />
    </div>
  );
}

export default function App() {
  useCalculation();
  const isWideScreen = useIsWideScreen();

  return isWideScreen ? <WideLayout /> : <CompactLayout />;
}
