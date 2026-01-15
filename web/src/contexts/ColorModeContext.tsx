import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ThemeProvider, useMediaQuery } from '@mui/material';
import type { PaletteMode } from '@mui/material';
import { createAppTheme } from '../utils/theme';

interface ColorModeContextType {
  mode: PaletteMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'light',
  toggleColorMode: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export const useColorMode = () => useContext(ColorModeContext);

interface ColorModeProviderProps {
  children: ReactNode;
}

export const ColorModeProvider = ({ children }: ColorModeProviderProps) => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  // Initialize from localStorage or system preference
  const getInitialMode = (): PaletteMode => {
    const stored = localStorage.getItem('colorMode');
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return prefersDarkMode ? 'dark' : 'light';
  };

  const [mode, setMode] = useState<PaletteMode>(getInitialMode);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prevMode) => {
          const newMode = prevMode === 'light' ? 'dark' : 'light';
          localStorage.setItem('colorMode', newMode);
          return newMode;
        });
      },
    }),
    [mode]
  );

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ColorModeContext.Provider>
  );
};
