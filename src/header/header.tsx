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
import { useDate } from '../date/date.hooks';
import { formatShortDate } from '../display/display.utils';
import Help from '../help/help';
import { useCloseOnBack } from '../history/history.hooks';
import { useIsWideScreen } from '../media/media.hooks';
import './header.scss';

type Dialog = 'help' | 'about';

type Props = {
  /** Toggles the filter panel on a wide screen, opens the filter drawer on a phone */
  onMenuClick: () => void;
  isCalendarOpen: boolean;
  onCalendarClick: () => void;
};

export default function Header({ onMenuClick, isCalendarOpen, onCalendarClick }: Props) {
  const isWideScreen = useIsWideScreen();
  const date = useDate();
  const [moreAnchor, setMoreAnchor] = useState<HTMLElement | null>(null);
  const [dialog, setDialog] = useState<Dialog | null>(null);
  const handleOpenMore = useCallback((event: MouseEvent<HTMLElement>) => setMoreAnchor(event.currentTarget), []);
  const handleCloseMore = useCallback(() => setMoreAnchor(null), []);
  const handleOpenHelp = useCallback(() => {
    setMoreAnchor(null);
    setDialog('help');
  }, []);
  const handleOpenAbout = useCallback(() => {
    setMoreAnchor(null);
    setDialog('about');
  }, []);
  const handleClose = useCallback(() => setDialog(null), []);
  useCloseOnBack(!!dialog, handleClose);

  return (
    <AppBar position="static" color="inherit" elevation={2} className="Header">
      <IconButton onClick={onMenuClick} aria-label="Filter">
        <MenuIcon />
      </IconButton>
      {/* on a phone the date takes the room of the title */}
      {isWideScreen && <span className="title">Astroffers</span>}
      <div className="spacer" />
      <Button
        color={isCalendarOpen ? 'primary' : 'inherit'}
        startIcon={<CalendarMonthOutlinedIcon />}
        onClick={onCalendarClick}
        aria-label="Calendar"
        aria-expanded={isCalendarOpen}
      >
        {formatShortDate(date)}
      </Button>
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
      <Help isOpen={dialog === 'help'} onClose={handleClose} />
      <About isOpen={dialog === 'about'} onClose={handleClose} />
    </AppBar>
  );
}
