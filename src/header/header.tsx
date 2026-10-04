import { type MouseEvent, useCallback, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import HelpOutlineOutlinedIcon from '@mui/icons-material/HelpOutlineOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const handleOpenMore = useCallback((event: MouseEvent<HTMLElement>) => setMoreAnchor(event.currentTarget), []);
  const handleCloseMore = useCallback(() => setMoreAnchor(null), []);
  const handleOpenCalendar = useCallback(() => navigate('/calendar'), [navigate]);
  const handleOpenHelp = useCallback(() => {
    setMoreAnchor(null);
    navigate('/help');
  }, [navigate]);
  const handleOpenAbout = useCallback(() => {
    setMoreAnchor(null);
    navigate('/about');
  }, [navigate]);
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
        <Button color="inherit" startIcon={<CalendarMonthOutlinedIcon />} onClick={handleOpenCalendar}>
          Calendar
        </Button>
      ) : (
        <IconButton onClick={handleOpenCalendar} aria-label="Calendar">
          <CalendarMonthOutlinedIcon />
        </IconButton>
      )}
      <IconButton onClick={handleOpenMore} aria-label="More" aria-haspopup="menu">
        <MoreVertIcon />
      </IconButton>
      <Menu
        anchorEl={moreAnchor}
        open={!!moreAnchor}
        onClose={handleCloseMore}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleOpenHelp}>
          <ListItemIcon>
            <HelpOutlineOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Help</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleOpenAbout}>
          <ListItemIcon>
            <InfoOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>About</ListItemText>
        </MenuItem>
      </Menu>
      <Calendar isOpen={isCalendarOpen} onClose={handleClose} />
      <Help isOpen={isHelpOpen} onClose={handleClose} />
      <About isOpen={isAboutOpen} onClose={handleClose} />
    </AppBar>
  );
}
