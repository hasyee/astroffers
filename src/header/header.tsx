import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useCallback, useState } from 'react';
import About from '../about/about';
import Calendar from '../calendar/calendar';
import Help from '../help/help';
import { useIsWideScreen } from '../media/media.hooks';
import './header.scss';

export default function Header({ onOpenFilter }: { onOpenFilter?: () => void }) {
  const isWideScreen = useIsWideScreen();
  const [openedDialog, setOpenedDialog] = useState<'calendar' | 'help' | 'about' | null>(null);
  const handleOpenCalendar = useCallback(() => setOpenedDialog('calendar'), []);
  const handleOpenHelp = useCallback(() => setOpenedDialog('help'), []);
  const handleOpenAbout = useCallback(() => setOpenedDialog('about'), []);
  const handleClose = useCallback(() => setOpenedDialog(null), []);

  return (
    <AppBar position="static" color="inherit" elevation={2} className="Header">
      {onOpenFilter && (
        <IconButton onClick={onOpenFilter} aria-label="Filter">
          <MenuIcon />
        </IconButton>
      )}
      <img className="logo" src="/icons/logo.png" alt="" />
      <span className="title">Astroffers</span>
      <div className="spacer" />
      {isWideScreen ? (
        <>
          <Button color="inherit" startIcon={<CalendarMonthOutlinedIcon />} onClick={handleOpenCalendar}>
            Calendar
          </Button>
          <Button color="inherit" startIcon={<HelpOutlineOutlinedIcon />} onClick={handleOpenHelp}>
            Help
          </Button>
          <Button color="inherit" startIcon={<InfoOutlinedIcon />} onClick={handleOpenAbout}>
            About
          </Button>
        </>
      ) : (
        <>
          <IconButton onClick={handleOpenCalendar} aria-label="Calendar">
            <CalendarMonthOutlinedIcon />
          </IconButton>
          <IconButton onClick={handleOpenHelp} aria-label="Help">
            <HelpOutlineOutlinedIcon />
          </IconButton>
          <IconButton onClick={handleOpenAbout} aria-label="About">
            <InfoOutlinedIcon />
          </IconButton>
        </>
      )}
      <Calendar isOpen={openedDialog === 'calendar'} onClose={handleClose} />
      <Help isOpen={openedDialog === 'help'} onClose={handleClose} />
      <About isOpen={openedDialog === 'about'} onClose={handleClose} />
    </AppBar>
  );
}
