import { createTheme } from '@mui/material/styles';

export const greekTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0D47A1', // A deep, rich blue
    },
    secondary: {
      main: '#FFC107', // A vibrant, warm gold
    },
    background: {
      default: '#121212', // A standard dark background
      paper: '#1E1E1E',   // The color for surfaces like cards
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#BDBDBD',
    },
  },
  typography: {
    fontFamily: '"Cinzel", serif', // Set Cinzel as the default font
    h4: {
      fontWeight: 700, // Make headings bolder
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 700, // Make button text bolder
    }
  },
});