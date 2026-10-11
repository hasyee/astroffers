import { createSvgIcon } from '@mui/material/utils';

/**
 * A German equatorial mount on a tripod, its tube along the polar axis (in its home position), a dashed line towards the
 * pole: the toggle of the equatorial orientation (none in `@mui/icons-material`)
 */
export const EquatorialMountIcon = createSvgIcon(
  <>
    <g fill="none" stroke="currentColor" strokeLinecap="round">
      <path d="M10 16 L5.5 22 M10 16 L14.5 22 M10 16 V22" strokeWidth="1.6" />
      <path d="M10 16 L13.5 12.5" strokeWidth="3.2" />
      <path d="M13.5 12.5 L21.5 4.5" strokeWidth="1.6" strokeDasharray="1.5 2" />
      <path d="M13.5 12.5 L8.5 7.5 M13.5 12.5 L17 16" strokeWidth="1.8" />
    </g>
    <rect x="2.5" y="6" width="11" height="4" rx="0.8" transform="rotate(-45 8 8)" />
    <circle cx="17.6" cy="16.6" r="2" />
  </>,
  'EquatorialMount'
);
