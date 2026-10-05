import { useCallback, useState } from 'react';
import classnames from 'classnames';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Calendar from '../calendar/calendar';
import { useCalendarPrefetch } from '../calendar/calendar.hooks';
import Details from '../details/details';
import { ResetFilterButton } from '../filter/filter';
import Header from '../header/header';
import { useCloseOnBack } from '../history/history.hooks';
import List from '../list/list';
import { useHasFilterPanel, useIsWideScreen } from '../media/media.hooks';
import { useCalculation } from '../result/result.hooks';
import Sidebar from '../sidebar/sidebar';
import SidebarDialogProvider from '../sidebar/sidebar.dialogs';
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
        <ResetFilterButton />
        <IconButton onClick={onClose} aria-label="Close">
          <CloseIcon />
        </IconButton>
      </div>
      <Sidebar hasHeader={false} />
    </Drawer>
  );
}

/**
 * Filter panel and table. The filter panel is open by default, the menu button of the header closes and opens it;
 * below `FILTER_PANEL_QUERY` there is no room for it beside the summary, so the filter is in a drawer instead.
 */
type LayoutProps = { isCalendarOpen: boolean; onToggleCalendar: () => void };

function WideLayout({ isCalendarOpen, onToggleCalendar }: LayoutProps) {
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
      <Header
        onMenuClick={hasFilterPanel ? handleToggleFilter : handleOpenDrawer}
        isCalendarOpen={isCalendarOpen}
        onCalendarClick={onToggleCalendar}
      />
      <main>
        {hasFilterPanel && (
          <aside className={classnames({ closed: !isPanelOpen })} inert={!isPanelOpen}>
            <Sidebar />
          </aside>
        )}
        <section>
          <Calendar isOpen={isCalendarOpen} />
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

/** Summary bar, cards and the filter in a drawer; the open calendar shows the times of the night below it */
function CompactLayout({ isCalendarOpen, onToggleCalendar }: LayoutProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const handleOpenFilter = useCallback(() => setIsFilterOpen(true), []);
  const handleCloseFilter = useCallback(() => setIsFilterOpen(false), []);

  return (
    <div className="App compact">
      <Header onMenuClick={handleOpenFilter} isCalendarOpen={isCalendarOpen} onCalendarClick={onToggleCalendar} />
      <main className={classnames({ 'calendar-open': isCalendarOpen })}>
        <Calendar isOpen={isCalendarOpen} compact />
        <Summary compact isExpanded={isCalendarOpen} onToggle={onToggleCalendar} />
        <List compact />
      </main>
      <FilterDrawer isOpen={isFilterOpen} onClose={handleCloseFilter} />
      <Details />
    </div>
  );
}

export default function App() {
  useCalculation();
  useCalendarPrefetch();
  const isWideScreen = useIsWideScreen();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const handleToggleCalendar = useCallback(() => setIsCalendarOpen(isOpen => !isOpen), []);

  return (
    <SidebarDialogProvider>
      {isWideScreen ? (
        <WideLayout isCalendarOpen={isCalendarOpen} onToggleCalendar={handleToggleCalendar} />
      ) : (
        <CompactLayout isCalendarOpen={isCalendarOpen} onToggleCalendar={handleToggleCalendar} />
      )}
    </SidebarDialogProvider>
  );
}
