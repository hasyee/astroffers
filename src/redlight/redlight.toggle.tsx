import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import { useRedLight } from './redlight.hooks';
import './redlight.scss';

/** Toggles the red light mode: in the header, and in the details (and its map), which cover the header on a phone */
export default function RedLightToggle() {
  const [isRedLight, toggleRedLight] = useRedLight();

  return (
    <IconButton
      className="RedLightToggle"
      onClick={toggleRedLight}
      aria-label="Red light"
      aria-pressed={isRedLight}
      title="Red light"
    >
      {isRedLight ? <VisibilityIcon /> : <VisibilityOutlinedIcon />}
    </IconButton>
  );
}
