import { useRef } from 'react';
import IconButton from '@mui/material/IconButton';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import FlipIcon from '@mui/icons-material/Flip';
import PublicIcon from '@mui/icons-material/Public';
import type { NgcObject } from '../calculator/calculator.types';
import {
  type StarMapHandle,
  useFlip,
  useFlipSetter,
  useOrientationType,
  useOrientationTypeSetter,
  useStarMapCanvas
} from './starmap.hooks';
import './starmap.scss';

/**
 * The flips of the map, its equatorial orientation (the azimuthal one by default) and the object back to its center,
 * by icons only: below the map, as the footer of the details
 */
function StarMapToolbar({ handle }: { handle: StarMapHandle }) {
  const { horizontal, vertical } = useFlip();
  const setFlip = useFlipSetter();
  const isEquatorial = useOrientationType() === 'equatorial';
  const setOrientationType = useOrientationTypeSetter();

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
      <IconButton
        color={isEquatorial ? 'primary' : 'default'}
        onClick={() => setOrientationType(type => (type === 'equatorial' ? 'azimuthal' : 'equatorial'))}
        aria-label="Equatorial orientation"
        aria-pressed={isEquatorial}
        title="Equatorial orientation"
      >
        <PublicIcon />
      </IconButton>
      <IconButton onClick={handle.centerObject} aria-label="Center the object" title="Center the object">
        <FilterCenterFocusIcon />
      </IconButton>
    </div>
  );
}

/**
 * The stars and the lines of the constellations around the object, marked by a ring, and the horizon of now; its
 * toolbar below it, in the place of the content and the footer of the details
 */
export default function StarMap({ object }: { object: NgcObject }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handle = useStarMapCanvas(canvasRef, object);

  return (
    <div className="StarMap">
      <div className="sky">
        <canvas ref={canvasRef} />
      </div>
      <StarMapToolbar handle={handle} />
    </div>
  );
}
