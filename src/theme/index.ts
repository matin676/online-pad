import { createTheme } from '@mui/material/styles';

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'purple' | 'blue' | 'green' | 'rose' | 'orange';

const accentColors: Record<AccentColor, string> = {
  purple: '#6750A4',
  blue: '#0061A4',
  green: '#006D32',
  rose: '#9C4275',
  orange: '#8B5000'
};

export const getTheme = (mode: ThemeMode, accent: AccentColor) => {
  const seedColor = accentColors[accent];
  
  return createTheme({
    palette: {
      mode,
      primary: {
        main: seedColor,
      },
      secondary: {
        main: '#625b71',
      },
      background: {
        default: mode === 'light' ? '#ffffff' : '#121212',
        paper: mode === 'light' ? '#ffffff' : '#1e1e1e',
      },
      text: {
        primary: mode === 'light' ? '#202124' : '#e8eaed',
        secondary: mode === 'light' ? '#5f6368' : '#9aa0a6',
      }
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "system-ui", sans-serif',
      h2: { 
        fontWeight: 700, 
        letterSpacing: -1,
        fontSize: 'clamp(2rem, 5vw, 3.75rem)'
      },
      h6: {
        fontWeight: 600,
        fontSize: 'clamp(1rem, 2.5vw, 1.25rem)'
      },
      body1: {
        fontSize: 'clamp(0.9rem, 2vw, 1rem)'
      },
      body2: {
        fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)'
      }
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            padding: '10px 24px',
            fontWeight: 600,
            minHeight: '48px',
            minWidth: '48px',
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            minHeight: '48px',
            minWidth: '48px',
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};
