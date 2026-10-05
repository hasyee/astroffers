import { blueGrey, red } from '@mui/material/colors';
import { createTheme, darken } from '@mui/material/styles';
import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles';

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
 * Background of the app; also the theme color of the PWA as a hex (`#111619`, `THEME_COLOR` in `vite.config.ts`,
 * `index.html`), needed before the app is loaded
 */
const BACKGROUND = darken(blueGrey[900], 0.55);
const PAPER = darken(blueGrey[900], 0.4);

const theme = createTheme({
  // exposes the palette as CSS variables (`--mui-palette-*`) for the stylesheets
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: { default: BACKGROUND, paper: PAPER },
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
