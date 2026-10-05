import { useState } from 'react';
import type { MouseEvent } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import type { NgcInfo } from '../calculator/calculator.types';
import { formatTime } from '../display/display.utils';
import { useIsWideScreen } from '../media/media.hooks';
import { useResultParams } from '../result/result.hooks';
import { getStellariumWebUrl, getWikipediaUrl } from './external.utils';
import './external.scss';

/**
 * Opens the object elsewhere in a new tab (or in the app taking over the link): on Stellarium Web (a submenu: now or
 * at its best visibility in the night of the list, from its place) or on Wikipedia
 */
export default function OpenInMenu({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const params = useResultParams();
  const isWideScreen = useIsWideScreen();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [stellariumAnchor, setStellariumAnchor] = useState<HTMLElement | null>(null);
  const close = () => {
    setAnchor(null);
    setStellariumAnchor(null);
  };

  if (!params) return null;
  const { max } = ngcInfo;

  return (
    <>
      <Button
        endIcon={<ArrowDropDownIcon />}
        onClick={event => setAnchor(event.currentTarget)}
        aria-haspopup="menu"
        aria-expanded={!!anchor}
      >
        Open in
      </Button>
      <Menu
        open={!!anchor}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className="OpenInMenu"
      >
        <MenuItem
          onClick={(event: MouseEvent<HTMLElement>) => setStellariumAnchor(event.currentTarget)}
          aria-haspopup="menu"
          aria-expanded={!!stellariumAnchor}
        >
          Stellarium
          <ChevronRightIcon className="submenu" />
        </MenuItem>
        <MenuItem component="a" href={getWikipediaUrl(ngcInfo.object)} target="_blank" rel="noopener" onClick={close}>
          Wikipedia
        </MenuItem>
      </Menu>
      <Menu
        open={!!stellariumAnchor}
        anchorEl={stellariumAnchor}
        onClose={() => setStellariumAnchor(null)}
        // beside the item; above it on a phone, which has no room beside the menu
        anchorOrigin={isWideScreen ? { vertical: 'top', horizontal: 'right' } : { vertical: 'top', horizontal: 'left' }}
        transformOrigin={
          isWideScreen ? { vertical: 'top', horizontal: 'left' } : { vertical: 'bottom', horizontal: 'left' }
        }
        className="OpenInMenu"
      >
        <MenuItem
          component="a"
          href={getStellariumWebUrl(ngcInfo, Date.now(), params.coords)}
          target="_blank"
          rel="noopener"
          onClick={close}
        >
          Now
        </MenuItem>
        {max !== null && (
          <MenuItem
            component="a"
            href={getStellariumWebUrl(ngcInfo, max, params.coords)}
            target="_blank"
            rel="noopener"
            onClick={close}
          >
            At best visibility
            <span className="time">{formatTime(max)}</span>
          </MenuItem>
        )}
      </Menu>
    </>
  );
}
