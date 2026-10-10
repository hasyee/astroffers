import IconButton from '@mui/material/IconButton';
import FlipIcon from '@mui/icons-material/Flip';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import EmptyState from '../empty/empty';
import { useFlip, useFlipSetter } from './starmap.hooks';
import './starmap.scss';

/** The flips of the map, by icons only: in the footer of the details on the route of the map */
export function StarMapToolbar() {
  const { horizontal, vertical } = useFlip();
  const setFlip = useFlipSetter();

  return (
    <div className="StarMapToolbar">
      <IconButton
        color={horizontal ? 'primary' : 'default'}
        onClick={() => setFlip(flip => ({ horizontal: !flip.horizontal }))}
        aria-label="Flip horizontally"
        aria-pressed={horizontal}
        title="Flip horizontally"
      >
        <FlipIcon />
      </IconButton>
      <IconButton
        className="vertical"
        color={vertical ? 'primary' : 'default'}
        onClick={() => setFlip(flip => ({ vertical: !flip.vertical }))}
        aria-label="Flip vertically"
        aria-pressed={vertical}
        title="Flip vertically"
      >
        <FlipIcon />
      </IconButton>
    </div>
  );
}

export default function StarMap() {
  return (
    <div className="StarMap">
      <EmptyState icon={<MapOutlinedIcon />} title="Star map" description="Coming soon" />
    </div>
  );
}
