import { createTheme } from '@mui/material/styles';

/** Background of the app, also the theme color of the PWA (`vite.config.ts`, `index.html`) */
export const BACKGROUND = '#111418';
export const PAPER = '#1c2127';

const theme = createTheme({
  // exposes the palette as CSS variables (`--mui-palette-*`) for the stylesheets
  cssVariables: true,
  palette: {
    mode: 'dark',
    background: { default: BACKGROUND, paper: PAPER }
  },
  typography: {
    // a dense app: 14px instead of 16px as the base size
    fontSize: 14,
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
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
    MuiButton: { defaultProps: { disableElevation: true } },
    MuiTextField: { defaultProps: { size: 'small', fullWidth: true } },
    MuiFormControl: { defaultProps: { size: 'small' } }
  }
});

export default theme;
