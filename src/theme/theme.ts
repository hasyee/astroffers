import { common, red } from '@mui/material/colors';
import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    red: PaletteColor;
  }
  interface PaletteOptions {
    red?: PaletteColorOptions;
  }
}

// the light and dark shades of a custom color are not computed by `createTheme`, only of the built-in ones
const { augmentColor } = createTheme({ palette: { mode: 'dark' } }).palette;

/**
 * Black as the night sky; also the theme color of the PWA as a hex (`#000000`, `THEME_COLOR` in `vite.config.ts`,
 * `index.html`), needed before the app is loaded
 */
const BACKGROUND = common.black;
/** The papers (the header, the sidebar, the summary, the dialogs, the menus) raised over the black: 7.5% white over it */
const PAPER = '#131313';

const theme = createTheme({
  // exposes the palette as CSS variables (`--mui-palette-*`) for the stylesheets
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: { default: BACKGROUND, paper: PAPER },
    // a shade lighter than the default (12%), to part the black papers
    divider: 'rgba(255, 255, 255, 0.18)',
    // its dark shade (#aa2e25) is today in the calendar and the red light toggle of the header
    red: augmentColor({ color: { main: red[500] }, name: 'red' })
  },
  typography: {
    // a dense app: 14px instead of 16px as the base size
    fontSize: 14,
    // bundled (`index.tsx`); the system fonts only until it is loaded
    fontFamily: [
      '"Inter Variable"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Oxygen',
      'Ubuntu',
      'Cantarell',
      '"Fira Sans"',
      '"Droid Sans"',
      '"Helvetica Neue"',
      'sans-serif'
    ].join(',')
  },
  components: {
    // no lighter overlay on the elevated surfaces (dark mode default): every paper is the same dark color
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    // smaller than the default h6, to fit the longer names of the objects in the details
    MuiDialogTitle: { styleOverrides: { root: { fontSize: '1rem' } } },
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiFormControl: { defaultProps: { size: 'small' } }
  }
});

export default theme;
