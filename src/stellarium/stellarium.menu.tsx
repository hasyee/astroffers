import { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import type { NgcInfo } from '../calculator/calculator.types';
import { formatTime } from '../display/display.utils';
import { useResultParams } from '../result/result.hooks';
import { getStellariumWebUrl } from './stellarium.utils';
import './stellarium.scss';

/** Opens the object on Stellarium Web in a new tab, now or at its best visibility in the night of the list */
export default function StellariumMenu({ ngcInfo }: { ngcInfo: NgcInfo }) {
  const params = useResultParams();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const close = () => setAnchor(null);

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
        Stellarium
      </Button>
      <Menu
        open={!!anchor}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        className="StellariumMenu"
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
