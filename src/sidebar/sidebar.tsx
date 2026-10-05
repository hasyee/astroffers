import { useCallback } from 'react';
import Button from '@mui/material/Button';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Filter, { ResetFilterButton } from '../filter/filter';
import { useStateSetter } from '../provider/state.hooks';
import { SidebarDialogContext } from './sidebar.hooks';
import './sidebar.scss';

/**
 * The filter panel of a wide screen and the content of the filter drawer: the reset button, the filter and the
 * About and Help (shown by `SidebarDialogProvider`). `hasHeader={false}` leaves out the bar of the reset button, when the drawer shows it in its header.
 */
export default function Sidebar({ hasHeader = true }: { hasHeader?: boolean }) {
  const setDialog = useStateSetter(SidebarDialogContext);
  const handleOpenHelp = useCallback(() => setDialog('help'), [setDialog]);
  const handleOpenAbout = useCallback(() => setDialog('about'), [setDialog]);

  return (
    <div className="Sidebar">
      {hasHeader && (
        <div className="header">
          <ResetFilterButton />
        </div>
      )}
      <div className="content">
        <Filter />
      </div>
      <div className="footer">
        <Button startIcon={<InfoOutlinedIcon />} onClick={handleOpenAbout}>
          About
        </Button>
        <Button startIcon={<HelpOutlineOutlinedIcon />} onClick={handleOpenHelp}>
          Help
        </Button>
      </div>
    </div>
  );
}
