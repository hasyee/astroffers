import { useRef, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import FlipIcon from '@mui/icons-material/Flip';
import PublicIcon from '@mui/icons-material/Public';
import ScheduleIcon from '@mui/icons-material/Schedule';
import type { NgcInfo, Timestamp } from '../calculator/calculator.types';
import { useDate } from '../date/date.hooks';
import { formatDateTime, formatTime } from '../display/display.utils';
import {
  type StarMapHandle,
  useFlip,
  useFlipSetter,
  useMapTime,
  useMapTimeSetter,
  useOrientationType,
  useOrientationTypeSetter,
  useStarMapCanvas
} from './starmap.hooks';
import { getBestTime, isBestTime, isInNight, isNowTime } from './starmap.utils';
import './starmap.scss';

/**
 * Chooses the time of the map: now, or the best visibility of the object; the one the time of the map is (now within a
 * few minutes, told at the opening of the menu) is selected, none for another time (e.g. of an older link)
 */
function TimeMenu({ ngcInfo, time }: { ngcInfo: NgcInfo; time: Timestamp }) {
  const setTime = useMapTimeSetter();
  const [menu, setMenu] = useState<{ anchor: HTMLElement; now: Timestamp } | null>(null);
  const bestTime = getBestTime(ngcInfo);
  const choose = (chosen: Timestamp) => {
    setTime(chosen);
    setMenu(null);
  };

  return (
    <>
      <IconButton
        onClick={event => setMenu({ anchor: event.currentTarget, now: Date.now() })}
        aria-label="Time"
        title="Time"
        aria-haspopup="menu"
        aria-expanded={!!menu}
      >
        <ScheduleIcon />
      </IconButton>
      <Menu
        open={!!menu}
        anchorEl={menu?.anchor}
        onClose={() => setMenu(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MenuItem selected={!!menu && isNowTime(time, menu.now)} onClick={() => choose(Date.now())}>
          Now
        </MenuItem>
        <MenuItem
          selected={isBestTime(ngcInfo, time)}
          disabled={bestTime === null}
          onClick={() => bestTime !== null && choose(bestTime)}
        >
          At best visibility
        </MenuItem>
      </Menu>
    </>
  );
}

/**
 * The flips of the map, its equatorial orientation (the azimuthal one by default), its time and the object back to its
 * center, by icons only: below the map, as the footer of the details
 */
function StarMapToolbar({ handle, ngcInfo, time }: { handle: StarMapHandle; ngcInfo: NgcInfo; time: Timestamp }) {
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
      <TimeMenu ngcInfo={ngcInfo} time={time} />
      <IconButton onClick={handle.centerObject} aria-label="Center the object" title="Center the object">
        <FilterCenterFocusIcon />
      </IconButton>
    </div>
  );
}

/**
 * The stars and the lines of the constellations around the object, marked by a ring, and the horizon of the time of
 * the map, written in its corner (with its day when not in the chosen night); its toolbar below it, in the place of the
 * content and the footer of the details
 */
export default function StarMap({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const date = useDate();
  const time = useMapTime(ngcInfo);
  const handle = useStarMapCanvas(canvasRef, ngcInfo.object, time);

  return (
    <div className="StarMap">
      <div className="sky">
        <canvas ref={canvasRef} />
        <div className="time">{isInNight(time, date) ? formatTime(time) : formatDateTime(time)}</div>
      </div>
      <StarMapToolbar handle={handle} ngcInfo={ngcInfo} time={time} />
    </div>
  );
}
