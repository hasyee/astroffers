import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useCallback } from 'react';
import About from '../about/about';
import Calendar from '../calendar/calendar';
import Help from '../help/help';
import { useIsWideScreen } from '../media/media.hooks';
import { useGoBack, useMatchPath, useNavigate } from '../router/router.hooks';
import './header.scss';

/** `onMenuClick` toggles the filter panel on a wide screen, opens the filter drawer on a phone */
export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const isWideScreen = useIsWideScreen();
  const navigate = useNavigate();
  const handleClose = useGoBack();
  const handleOpenCalendar = useCallback(() => navigate('/calendar'), [navigate]);
  const handleOpenHelp = useCallback(() => navigate('/help'), [navigate]);
  const handleOpenAbout = useCallback(() => navigate('/about'), [navigate]);
  // the dialogs are opened by their routes, but stay mounted to animate their closing
  const isCalendarOpen = !!useMatchPath('calendar');
  const isHelpOpen = !!useMatchPath('help');
  const isAboutOpen = !!useMatchPath('about');

  return (
    <AppBar position="static" color="inherit" elevation={2} className="Header">
      <IconButton onClick={onMenuClick} aria-label="Filter">
        <MenuIcon />
      </IconButton>
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
      <Calendar isOpen={isCalendarOpen} onClose={handleClose} />
      <Help isOpen={isHelpOpen} onClose={handleClose} />
      <About isOpen={isAboutOpen} onClose={handleClose} />
    </AppBar>
  );
}
