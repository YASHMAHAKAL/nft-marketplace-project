import React, { createContext, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { greekTheme } from './theme';

// We create a context, but we don't need to put anything in it for now.
const ThemeContext = createContext({});

// This line exports the hook that components will use.
export const useThemeContext = () => useContext(ThemeContext);

export const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // The value here could be used to provide a toggle function in the future
  const value = {}; 

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={greekTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};