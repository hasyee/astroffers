import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import About from '../about/about';
import Filter, { ResetFilterButton } from '../filter/filter';
import Help from '../help/help';
import { useCloseOnBack } from '../history/history.hooks';
import './sidebar.scss';

/**
 * The filter panel of a wide screen and the content of the filter drawer: the reset button, the filter and the
 * About and Help. `hasHeader={false}` leaves out the bar of the reset button, when the drawer shows it in its header.
 */
export default function Sidebar({ hasHeader = true }: { hasHeader?: boolean }) {
  const [dialog, setDialog] = useState<'help' | 'about' | null>(null);
  const handleOpenHelp = useCallback(() => setDialog('help'), []);
  const handleOpenAbout = useCallback(() => setDialog('about'), []);
  const handleClose = useCallback(() => setDialog(null), []);
  useCloseOnBack(!!dialog, handleClose);

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
      <Help isOpen={dialog === 'help'} onClose={handleClose} />
      <About isOpen={dialog === 'about'} onClose={handleClose} />
    </div>
  );
}
