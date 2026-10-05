import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import { useDate } from '../date/date.hooks';
import { formatShortDate } from '../display/display.utils';
import { useRedLight } from '../redlight/redlight.hooks';
import './header.scss';

type Props = {
  /** Toggles the filter panel on a wide screen, opens the filter drawer on a phone */
  onMenuClick: () => void;
  isCalendarOpen: boolean;
  onCalendarClick: () => void;
};

export default function Header({ onMenuClick, isCalendarOpen, onCalendarClick }: Props) {
  const date = useDate();
  const [isRedLight, toggleRedLight] = useRedLight();

  return (
    <AppBar position="static" color="inherit" elevation={2} className="Header">
      <IconButton onClick={onMenuClick} aria-label="Filter">
        <MenuIcon />
      </IconButton>
      <div className="spacer" />
      <IconButton
        className="red-light-toggle"
        onClick={toggleRedLight}
        aria-label="Red light"
        aria-pressed={isRedLight}
        title="Red light"
      >
        {isRedLight ? <VisibilityIcon /> : <VisibilityOutlinedIcon />}
      </IconButton>
      <Button
        color={isCalendarOpen ? 'primary' : 'inherit'}
        startIcon={<CalendarMonthOutlinedIcon />}
        onClick={onCalendarClick}
        aria-label="Calendar"
        aria-expanded={isCalendarOpen}
      >
        {formatShortDate(date)}
      </Button>
    </AppBar>
  );
}
